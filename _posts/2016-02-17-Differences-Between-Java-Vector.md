---
layout: post
title: Differences between Java Vector class and Java ArrayList class
---
 

This is one of basic java interview questions. Since I seldom use or see java vector class, I didn't really know the answer here. So I did some research to find out the difference.

---

## What is Vector

see [java doc](https://docs.oracle.com/javase/7/docs/api/java/util/Vector.html)

> The Vector class implements a growable array of objects. Like an array, it contains components that can be accessed using an integer index. However, the size of a Vector can grow or shrink as needed to accommodate adding and removing items after the Vector has been created.

Vector and ArrayList are both implementations of List interface.

---

## Differences

### 1. Synchronization.
As it's mentioned in ArrayList API doc, ArrayList class is similar to Vector class except ArrayList is not synchronized. If we still need to use ArrayList in a synchronized way, we can do like this at the stage of creation:

~~~ java
  List list = Collections.synchronizedList(new ArrayList(...));
~~~

###2. Performance.
ArrayList has better performance since it is non-synchronized.

###3. Storage Management
In order to optimize storage management, each vector maintain capacity and capacityIncrement. Each arraylist only has capacity and it grows automatically. 

But how they grow ?

When we look at the grow() function, we know the arraylist grow by half size of original one.

~~~ java
  int newCapacity = oldCapacity + (oldCapacity >> 1);
~~~

As for Vector, if you specified capacityIncrement, it will grow by the number you set, otherwise it will grow by the size of original list.

~~~ java
  int newCapacity = oldCapacity + ((capacityIncrement > 0) ? capacityIncrement : oldCapacity);
~~~

###4. Fail-fast behavior
First, what is fail-fast ?

see [java doc](https://docs.oracle.com/javase/7/docs/api/java/util/Vector.html#fail-fast)

>  if the vector is structurally modified at any time after the iterator is created, in any way except through the iterator's own remove() or add() methods, the iterator will throw an exception ConcurrentModificationException. Thus, in the face of concurrent modification, the iterator fails quickly and cleanly, rather than risking arbitrary, non-deterministic behavior at an undetermined time in the future.

In both Vector and ArrayList class, the iterator and listIterator are fail-fast, while enumeration in Vector is not fail-fast. When doing iteration, we can't add or remove element from the list if iterator doesn't have its own remove and add methods. 