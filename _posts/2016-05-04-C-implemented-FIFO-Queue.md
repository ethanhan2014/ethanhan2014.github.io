---
layout: post
title: Simple FIFO Queue Implementation in C
---

In the distributed system class, one of the famous problems would be Producer-Consumer problem. Here, I provided my solution to this problem by implementing a simple FIFO queue.

Besides supporting basic enqueue and dequeue functions, sorting and searching function is also provided. 

Header File msg_queue.h

~~~ c 

#include <pthread.h>

#define Q_SIZE 30       //define the maximum size of buffer
#define MSG_SIZE 1024   //define the size of message content

pthread_mutex_t queue_lock;
pthread_mutex_t full_lock;
pthread_mutex_t empty_lock;

//message header structure
struct msg_header {
  int timestamp;          // timestamp of receiving message
  int msg_type;           // message type
};

//message structure
struct message {
  struct msg_header header;      //header information contains information about individual machine
  char content[MSG_SIZE];  // contains the chatting information 
};

//message queue structure
struct msg_queue {
  struct message queue[Q_SIZE];
  int rear;
  int front;
};

//constructor of the queue
struct msg_queue *initQueue();

//return 0 for successful operation, return 1 for failed operation
int enqueue(struct msg_queue *q, struct message *node);

//return 0 for successful operation, return 1 for failed operation
int dequeue(struct msg_queue *q, struct message *node);

//return 1 for true and 0 for false
int isEmpty(struct msg_queue *q);

//return current size of message queue
int size(struct msg_queue *q);

//insertion sort message based on msg_type
void insertionSort(struct msg_queue *q);

//swap node
void swap(struct message *a, struct message *b);

~~~

Implementation msg_queue.c

~~~ c 

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <pthread.h>
#include <unistd.h>

#include "msg_queue.h"

struct msg_queue *initQueue()
{	
	struct msg_queue *q;
	q = (struct msg_queue *)malloc(sizeof(struct msg_queue));
	q->rear = -1;
	q->front = -1;
	pthread_mutex_init(&queue_lock, NULL);
	pthread_mutex_init(&empty_lock, NULL);
	pthread_mutex_init(&full_lock, NULL);
	return q;
}

int isEmpty(struct msg_queue *q)
{
	if(q->front==-1 && q->rear==-1) return 1;
	else return 0;
}

int enqueue(struct msg_queue *q, struct message *node)
{
	pthread_mutex_lock(&queue_lock);

	if((q->rear+1)%Q_SIZE == q->front)  //queue is full
	{
		pthread_mutex_unlock(&queue_lock);
		pthread_mutex_lock(&full_lock);
		return 1;
	}
	else if(isEmpty(q))                    //queue is empty
	{
		q->front = 0;
		q->rear = 0;
		pthread_mutex_unlock(&empty_lock);
	}
	else
	{
		q->rear = (q->rear+1)%Q_SIZE;
	}
	q->queue[q->rear] = *node;

	pthread_mutex_unlock(&queue_lock);

	return 0;
}


int dequeue(struct msg_queue *q, struct message *node)
{
	pthread_mutex_lock(&queue_lock);
	if(isEmpty(q))                     //queue is empty
	{
		pthread_mutex_unlock(&queue_lock);
		pthread_mutex_lock(&empty_lock);
		return 1;
	}
	else if(q->front == q->rear)
	{
		*node = q->queue[q->front];
		memset(&q->queue[q->front], 0, sizeof(struct message));

		q->front = -1;
		q->rear = -1;
	}
	else
	{
		if((q->rear+1)%Q_SIZE == q->front) { //queue is full
			pthread_mutex_unlock(&full_lock);
		}  

		*node = q->queue[q->front];
		memset(&q->queue[q->front], 0, sizeof(struct message));
		q->front = (q->front+1)%Q_SIZE;
	}

	pthread_mutex_unlock(&queue_lock);
	return 0;
}

int size(struct msg_queue *q)
{
	if(isEmpty(q))
	{
		return 0;
	}
	else
	{
		if(q->rear >= q->front)
		{
			return (q->rear-q->front+1);
		}
		else
		{
			return (q->rear+Q_SIZE-q->front+1);
		}
	}
}

void insertionSort(struct msg_queue *q)
{
	int i;
	int j;
	struct message *node;
	for(i=1;i<size(q);i++)
	{
		node = &q->queue[(q->front+i)%Q_SIZE];

		j = i-1;
		struct message *newnode;
		newnode = &q->queue[(q->front+j)%Q_SIZE];
		while(j>-1 
			&& newnode->header.msg_type > node->header.msg_type)
		{
			swap(newnode, node);
			j--;
			node = newnode;
			newnode = &q->queue[(q->front+j)%Q_SIZE];
		}
	}
}

void swap(struct message *a, struct message *b)
{
	struct message temp;
	temp = *a;
	*a = *b;
	*b = temp;
}

~~~

Simple demo program to use message queue

~~~ c 

#include <stdio.h>
#include <stdlib.h>
#include <time.h>
#include <pthread.h>
#include <string.h>

#include "msg_queue.h"

void *produce(void *queue);
void *consume(void *queue);

int main(int argc, char const *argv[])
{
	struct msg_queue *queue;
	pthread_t t1, t2;

	queue = initQueue();

	if (pthread_create(&t1, NULL, produce, queue)) {
		perror("Error on creating thread.\n");
		exit(1);
	}

	if (pthread_create(&t1, NULL, consume, queue)) {
		perror("Error on creating thread.\n");
		exit(1);
	}

	pthread_join(t1, NULL);
	pthread_join(t2, NULL);

	return 0;
}

void *produce(void *queue) {
	struct message *msg;
	msg = (struct message *)malloc(sizeof(struct message));
	char buffer[MSG_SIZE];
	int i;
	i = 0;
	while(fgets(buffer,MSG_SIZE,stdin)) {
		bzero(msg, sizeof(*msg));
		strcpy(msg->content, buffer);
		msg->header.timestamp = (int)time(NULL);
		msg->header.msg_type = i%2;
		i++;
		while(enqueue(queue, msg)){
			enqueue(queue,msg);
		}
	}

	pthread_exit(0);
}

void *consume(void *queue) {

	struct message *msg;
	msg = (struct message *)malloc(sizeof(struct message));

	while(1) {
		bzero(msg, sizeof(*msg));
		insertionSort(queue);
		if (!dequeue(queue,msg)) {
			printf("At Time %d, someone says %s",msg->header.timestamp, msg->content);
		}
	}

	pthread_exit(0);
}

~~~
