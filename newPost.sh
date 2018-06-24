#!/bin/bash

read -p "Title: " title
read -p "Date [$(date +%Y-%m-%d)]: " date
# read -p "Categories (space-separated): " categories
read -p "Description: " description
read -p "Post Image URL (full size): " image

if [ -z "$date" ] # Default to current date
then
    date=$(date +%Y-%m-%d)
fi

title_url=$(echo "$title" | tr " " "-" | tr '[:upper:]' '[:lower:]')

function add {
    printf -- "$1\n" >> "_posts/$date-$title_url".md
}

# Append to file
add "---"
add "layout: post"
add "title: $title"
add "date: $date"
# add "categories:"
# for category in $categories
# do
#     add "    - $category"
# done
add "description: $description"
add "image: $image"
add "---\n"
add "Post content goes here!"
