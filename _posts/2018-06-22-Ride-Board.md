---
layout: post
title: "Ride Board"
date: 2018-06-22
excerpt: "Ride Board is a web application developed for Computer Science House. The application is used for hosting large-scale events during which members of the organization need to carpool in order to reach the event destination. It allows the users to host events, drivers to host their cars, and passengers to sign-up under a car."
image: "/images/ride-board/homepage.jpg"
git: https://github.com/ag-ayush/rides
---

## Introduction
[Ride Board](https://rideboard.csh.rit.edu) was born out of the necessity of making a modern ride board application as the one previously being used had an obsolete UI.
The project started off as a challenge with a friend in April. We wanted to build a working application within 48 hours, right before one of the major events would take place.
He had experience with database development and [Flask WTForms](http://flask.pocoo.org/docs/1.0/patterns/wtforms/), so he set up the database and the original forms in python to be used with ride board.
I took care of the front-end web development and some of the back-end development with regard to interfacing with the database.

## Flask Application
### Authentication
Computer Science House has internal accounts for its members and requires authentication for the services of the house.
Inspired by other Flask applications within the organization, I used the [flask_pyoidc](https://github.com/zamzterz/Flask-pyoidc) library for setting up authentication.
Recently I decided to remove it from the front page of the website as there are plans of adding Google authentication for users that currently do not have a CSH account but still want to participate in-house events.
### Database Query
I used [Flask-SQLAlchemy](http://flask-sqlalchemy.pocoo.org/2.3/) to accomplish the task of interacting with the database, and since the application uses [jinja](http://jinja.pocoo.org/docs/2.10/), the task of front-end development was straightforward.

## Front-End Development
Since the service was part of Computer Science House, I used the [CSH Material Bootstrap Theme](https://github.com/ComputerScienceHouse/csh-material-Bootstrap).
I figured it would be quite easy since I had experience in front-end development from a previous project, but this required different parts of Bootstrap due to the forms.
The application had an okay UI when it was first developed, but I figured it could be greatly improved with more time.
As a result, I reformatted the application and over the last week, I was able to improve the UI significantly.

In the process of reformatting, I decided to change the forms as well.
Originally we were using a drop-down UI for picking date and time, but the application now uses a [date-time picker](https://tempusdominus.github.io/Bootstrap-4/).
This also helped me gain experience in using Flask WTForms, they certainly make the process quite straightforward.

<span class="image fit"><img src="{{ "/images/ride-board/form.jpg" | absolute_url }}" alt="" /></span>

### Additional Features
Ride Board lacked several useful features due to the short time span of the development and the first release of the app. After the redesign last week, I added the following features:

- The capability to edit the event and car if you are the owner of it.

<span class="image fit"><img src="{{ "/images/ride-board/edit.jpg" | absolute_url }}" alt="" /></span>

- A confirmation dialog when deleting anything.

<span class="image fit"><img src="{{ "/images/ride-board/dialog.jpg" | absolute_url }}" alt="" /></span>

- An automated 'Need a Ride' car which is automatically generated upon the creation of an event.

<span class="image fit"><img src="{{ "/images/ride-board/needaride.jpg" | absolute_url }}" alt="" /></span>

- And a script to automatically delete the events from the database an hour after they are set to finish.
This one was a bit tricky as the server where this application was being hosted used UTC and CSH uses EST.
We found out about this bug after the first event was created as it would automatically delete itself due to the expiry date in EST being past the current UTC time.
However, with the help of [pytz](https://pypi.org/project/pytz/) module I was able to make the application run solely on EST.

All of these additions made the application much more useful and helped me gain a stronger understanding of databases and Bootstrap.

## Useful Tools
Aside from the tools mentioned throughout the blog, there were a couple more that helped speed up the process of developing this application.

- [Trello](https://trello.com/) was helpful with the project management.
It made the group organization easier, and it allowed us to have a backlog of ideas, some of which were developed recently.

- [Travis CI](https://travis-ci.org/) and [Pylint](https://www.pylint.org/) were helpful in making sure the code was written properly and that the builds were passing prior to roll out. This was important because this application is deployed through OpenShift Origin and set to automatically run the latest code from GitHub.

The project code is available on [GitHub](https://github.com/ag-ayush/rides).
