import json
import boto3
import math
from decimal import Decimal
from botocore.exceptions import ClientError
from boto3.dynamodb.conditions import Key

dynamodb = boto3.resource('dynamodb')

def lambda_handler(event, context):
    
    if (event['resource'] == '/update-location'):
        result = 'Hello from Lambda!'
        print(update_location(event))
    elif (event['resource'] == '/add-products'):
        result = 'Hello from Lambda!'
        print(add_products(event))
    elif (event['resource'] == '/wish-list'):
        result = get_wish_list(event)
        print(result)
    elif (event['resource'] == '/shopping-list'):
        result = get_shopping_list(event)
        print(result)
    elif (event['resource'] == '/take-products-to-shopping-list'):
        result = update_shopping_list(event)
        print(result)
    elif (event['resource'] == '/wish-lists'):
        result = get_wish_lists(event)
        print(result)

    return {
        'statusCode': 200,
        'headers': {
            "Access-Control-Allow-Headers": "Content-Type,X-Amz-Date,X-Amz-Security-Token,Authorization,X-Api-Key,X-Requested-With,Accept,Access-Control-Allow-Methods,Access-Control-Allow-Origin,Access-Control-Allow-Headers",
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
        },
        'body': json.dumps(result)
    }


def update_shopping_list(event):
    table_name = 'AllProducts'
    
    username = event["requestContext"]["authorizer"]["claims"]["cognito:username"]
    product_list = json.loads(event['body'])
    
    table = dynamodb.Table(table_name)
    
    for product in product_list:
        response = table.update_item(
            Key={
                'ID': product['pId']
            },
            ExpressionAttributeNames={"#st": "Status" },
            UpdateExpression="set Volunteer=:vol, VolunteerName=:volname, #st = :status",
            ExpressionAttributeValues={
                ':vol': username,
                ':volname': event["requestContext"]["authorizer"]["claims"]["name"],
                ':status': "In progress"
            },
            ReturnValues="UPDATED_NEW"
        )
        
    return "Updated the shopping list!"


def get_wish_lists(event):
    table_name = 'UserInfo'
    
    table = dynamodb.Table(table_name)
    
    username = event["requestContext"]["authorizer"]["claims"]["cognito:username"]
    # user_lat = event["requestContext"]["authorizer"]["claims"]['custom:latitude']
    # user_lon = event["requestContext"]["authorizer"]["claims"]['custom:longitude']
    
    volunteer = table.get_item(Key={'email': username})['Item']
    user_lat = volunteer['ulocation']['latitude']
    user_lon = volunteer['ulocation']['longitude']
    
    response = table.query(
        IndexName='vital-rating-index',
        KeyConditionExpression=Key('vital').eq('parameter'),
        ScanIndexForward=False # true = ascending, false = descending
    )
    
    user_ulocation = {}
    distance_from_volunteer = {}
    
    for user in response["Items"]: #sorted by rating list of dicts
        user_ulocation[user["email"]] = [user["ulocation"]["latitude"], user["ulocation"]["longitude"] ]
        distance_from_volunteer[user["email"]] = 0
        
    for key, value in user_ulocation.items():
        distance = calc_distance(user_lat, user_lon, value[0], value[1])
        distance_from_volunteer[key] = distance
    
    limit_distance = 10 # 10km
    users_within_distance = []
    for user in response['Items']:
        if distance_from_volunteer[user["email"]] <= limit_distance and user["email"] != username: # not himself
            users_within_distance.append({'email': user["email"], 'location': user["location"], 'distance': distance_from_volunteer[user["email"]], 'rating': user["rating"]})
    
    products_table_name = 'AllProducts'
    products_table = dynamodb.Table(products_table_name)
    
    requests_within_distance = []
    for user in users_within_distance:
        response = products_table.query(
            IndexName="User-index",
            KeyConditionExpression=Key('User').eq(user['email']),  #Key('Status').eq('In need')
            FilterExpression="#st = :status",
            ExpressionAttributeValues={
                ':status': "In need"
            },
            ExpressionAttributeNames={
                '#st': "Status"
            }
        )
        for product in response['Items']:
            product['Location'] = user['location']
            product['Distance'] = user['distance']
            product['Rating'] = float(user['rating'])
        
        requests_within_distance.extend(response['Items'])
    
    return requests_within_distance


def get_shopping_list(event):
    table_name = 'AllProducts'
    
    username = event["requestContext"]["authorizer"]["claims"]["cognito:username"]
    
    table = dynamodb.Table(table_name)
    
    response = table.query(
        IndexName="Volunteer-index",
        KeyConditionExpression=Key('Volunteer').eq(username)
    )
    return response['Items']


def get_wish_list(event):
    table_name = 'AllProducts'
    
    username = event["requestContext"]["authorizer"]["claims"]["cognito:username"]
    
    table = dynamodb.Table(table_name)
    
    response = table.query(
        IndexName="User-index",
        KeyConditionExpression=Key('User').eq(username)
    )
    return response['Items']


def add_products(event):
    table_name = 'AllProducts'
    
    username = event["requestContext"]["authorizer"]["claims"]["cognito:username"] #ex. cucutone-at-gmail.com
    product_list = json.loads(event['body'])
    
    table = dynamodb.Table(table_name)
    
    for product in product_list:
        response = table.put_item(
            Item={
                'ID': product['pId'],
                'ProductName': product['pName'],
                'Quantity': product['quantity'],
                'Description': product['description'],
                'Status': 'In need',
                'User': username,
                'UserLINE': event["requestContext"]["authorizer"]["claims"]["custom:line_id"],
                'Volunteer': '-',
                'Username': event["requestContext"]["authorizer"]["claims"]["name"],
                'VolunteerName': '-'
            }
        )
    
    
    return "All products added"


# updates location of user in db    
def update_location(event):
    table_name = 'UserInfo'
    
    username = event["requestContext"]["authorizer"]["claims"]["cognito:username"]
    request_body = json.loads(event['body'])
    
    table = dynamodb.Table(table_name)
    
    try:
        response = table.update_item(
            Key={
                'email': username
            },
            UpdateExpression="set ulocation.latitude=:lat, ulocation.longitude=:lon",
            ExpressionAttributeValues={
                ':lat': Decimal(str(request_body["NewLocation"]["Latitude"])),
                ':lon': Decimal(str(request_body["NewLocation"]["Longitude"]))
            },
            ReturnValues="UPDATED_NEW"
        )
    except ClientError:
        print(username + "seems to be a new user")
        response = table.put_item(
            Item={
                'email': username,
                'ulocation': {
                    'latitude': Decimal(str(request_body["NewLocation"]["Latitude"])),
                    'longitude': Decimal(str(request_body["NewLocation"]["Longitude"]))
                },
                'rating': Decimal(0.0),
                'location': '',
                'vital': 'parameter'
            }
        )
        
    return response
    

def calc_distance(lat_1, long_1, lat_2, long_2):
    if lat_1 == lat_2 and long_1 == long_2:
        return 0
    
    ra = 6378140  # radius of equator: meter
    rb = 6356755  # radius of polar: meter
    flatten = 0.003353 # Partial rate of the earth

    radLatA = math.radians(lat_1)
    radLonA = math.radians(long_1)
    radLatB = math.radians(lat_2)
    radLonB = math.radians(long_2)

    pA = math.atan( rb / ra * math.tan(radLatA))
    pB = math.atan( rb / ra * math.tan(radLatB))
    
    x = math.acos( (math.sin(pA) * math.sin(pB)) + (math.cos(pA) * math.cos(pB) * math.cos(radLonA - radLonB)) )
    c1 = ((math.sin(x) - x) * math.pow((math.sin(pA) + math.sin(pB)),2)) / math.pow(math.cos(x / 2),2) 
    c2 = ((math.sin(x) + x) * math.pow((math.sin(pA) - math.sin(pB)),2)) / math.pow(math.sin(x / 2),2)
    dr = flatten / 8 * (c1 - c2)
    distance = 0.001 * ra * (x + dr)
    
    return distance # distance is in km
    

# using numpy, but aws doesn't have this package !
# if you're done the lambda code, follow below short blog to zip .py and package into one zip and upload to lambda
# https://medium.com/@korniichuk/lambda-with-pandas-fd81aa2ff25e

# def calc_distance(lat_1, long_1, lat_2, long_2):
#     ra = 6378140  # radius of equator: meter
#     rb = 6356755  # radius of polar: meter
#     flatten = 0.003353 # Partial rate of the earth
#     # change angle to radians
    
#     radLatA = np.radians(lat_1)
#     radLonA = np.radians(long_1)
#     radLatB = np.radians(lat_2)
#     radLonB = np.radians(long_2)
 
#     pA = np.arctan(rb / ra * np.tan(radLatA))
#     pB = np.arctan(rb / ra * np.tan(radLatB))
    
#     x = np.arccos( np.multiply(np.sin(pA),np.sin(pB)) + np.multiply(np.multiply(np.cos(pA),np.cos(pB)),np.cos(radLonA - radLonB)))
#     c1 = np.multiply((np.sin(x) - x) , np.power((np.sin(pA) + np.sin(pB)),2)) / np.power(np.cos(x / 2),2)
#     c2 = np.multiply((np.sin(x) + x) , np.power((np.sin(pA) - np.sin(pB)),2)) / np.power(np.sin(x / 2),2)
#     dr = flatten / 8 * (c1 - c2)
#     distance = 0.001 * ra * (x + dr)
# 
#     return distance
