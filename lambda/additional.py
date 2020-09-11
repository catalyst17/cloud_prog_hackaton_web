import json
import boto3
from decimal import Decimal
from botocore.exceptions import ClientError

TOPIC_ARN = "arn:aws:sns:us-east-1:737969560173:FeedbackEmail"

dynamodb = boto3.resource('dynamodb')

def lambda_handler(event, context):
    
    print("something")
    if (event['resource'] == '/update-location'):
        print(update_location(event))
    elif (event['resource'] == '/add-products'):
        print(add_products(event))
    elif(event['resource'] == '/complete-products'):
        print(complete_products(event))
    return {
        'statusCode': 200,
        'headers': {
            "Access-Control-Allow-Headers": "Content-Type,X-Amz-Date,X-Amz-Security-Token,Authorization,X-Api-Key,X-Requested-With,Accept,Access-Control-Allow-Methods,Access-Control-Allow-Origin,Access-Control-Allow-Headers",
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'OPTIONS,POST'
        },
        'body': json.dumps('Hello from Lambda!')
    }


def complete_products(event):
    table_name = 'AllProducts'
    
    username = event["requestContext"]["authorizer"]["claims"]["cognito:username"]; #ex. cucutone-at-gmail.com
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
                'Volunteer': '-'
            }
        )
    
    
    return "All products added"
    
def send_email(body):
    # Create an SNS client
    sns = boto3.client('sns')
 
    # Publish a simple message to the specified SNS topic
    response = sns.publish(
        TopicArn=TOPIC_ARN,    
        Message=body,    
    )
 
    # Print out the response
    print(response)