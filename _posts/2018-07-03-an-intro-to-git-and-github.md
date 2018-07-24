---
layout: post
title: An Intro to Git
date: 2018-07-24
excerpt: This is a guide for using git as your version control system.
image: /images/intro-to-git/homepage.jpg
git:
---

## Installing Git

Depending on your operating system, details for installing git can be found on the official git [website](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git).
This tutorial is built with the use of an Ubuntu-based Linux system and bash.
You can install git on Ubuntu with the following command: `sudo apt-get install git`.

It is helpful to configure your information so that you do not have to type it in every time. This can done with the following commands:
```
git config --global user.name "<name>"
git config --global user.email "<email address>"
git config --global color.ui auto
```

## Creating a New Repository
A __repository__ or __repo__ is the directory where the project will be stored. Each repo has a hidden folder `/.git` which contains the history of your work. After creating a directory for your project, you can initialize git from within the directory using `git init`. Here is an example:

```bash
mkdir new-project
cd new-project
git init
```

Alternatively, you can __checkout__ a repo by running `git clone <url>`.

## Adding and Removing Files
When you make changes to a file, or create a new file, you need to __stage__ those files. Stage is simply a step for preparing the files for a __commit__ (this will come later). Staging can be helpful in many scenarios when developing. For example, you might be working on multiple features at the same time on a project and happen to only finish one of them on a given day. It makes sense to stage the files relating to the completed feature and committing  rather than committing all of the changes in the project.

You can check the status of your repo by running `git status` and see what files need to be _added_. Files can be added with `git add <filename> <filename2>` and all of the files can be added at the same time with `git add *`<sup> 1 </sup>. If you want to remove a file, i.e. prevent it from being tracked but still keep it locally, you can use `git rm --cached <filename>`. If you want to remove the file altogether from the project, you can use `git rm <filename>`, which will delete the file and stage the changes.

<sup> 1 </sup> <sub>Adding all the files at the same time should be used with precaution as you do not want to add anything that was created during the compiling process nor the files created by any IDEs. You can get around this problem by using a `.gitignore` file.</sub>

### gitignore
.gitignore is a text document that specifies files and paths that should be ignored during stage and commits or in other words have their tracking suppressed. The documentation on this can be found [here](https://git-scm.com/docs/gitignore). The basic format of the file is a list of project paths:
```
__pycache__
.idea/
file.o
```
and the file is stored under `/path/of/the/repository`.

## Committing and Pushing
Making a __commit__ translates to taking a snapshot of your code at a given time. You can use commits to go back and access specific stages of your repo, making this the main command behind the concept of version control. Typically, this is done using the `git commit -m "Commit message."` command, where you provide a message corresponding to the changes you have made to the code. The message is helpful for future references.

If you created a new repo, you will need to make a repo on a cloud service such as [GitHub](https://github.com) and then run the following to connect your local directory with the cloud:
```
git remote add origin https://github.com/<username>/<repository>
```
Commits are stored locally and in order to __push__ these to the cloud you would run `git push -u origin master`.

## Reviewing History
 - You can check local changes to your tracked files since the last commit with `git diff` and see specific file changes with `git diff <filename>`.
 - You can see the  commit history of you entire project with `git log`. This will list all of your commits with its hash, author, time, and message.
    - You can show changes from a specific commit with `git show <commit hash>`.
    - You can also see version history of a specific file with `git log --follow <filename>`.

## Branching (advanced topic)
The great thing about using git is that it allows you to collaborate and develop features isolated from one another through branching, you can read the in-depth explanation [here](https://git-scm.com/book/en/v1/Git-Branching). The default branch is `master`, that is the one that has been used throughout this article when the word master is mentioned.

Using `git branch <branch-name>`, a new branch can be created. Often these branches identify the feature you are developing, or any other identification regarding your work. You can __checkout__ a new branch using `git checkout <branch-name>`. Checking out a branch means changing your active branch, aka what branch you will be pushing changes to. In order to see all the branches in the repo, use `git branch`, and to delete a branch use `git branch -d <branch-name>`.

Anytime you commit or make changes under a different branch-name, it will be stored only in that branch, not the master. It should also be noted that once you make changes within a branch, you _cannot_ simply checkout a different branch to push changes to. You would have to __stash__ (next section) your changes, then checkout the branch you should be on, restore your changes, then commit. In short, make sure to be on the correct branch when working.

To merge your changes from another branch you have to use `git merge <branch-name>`. This will specifically combine the _specified_ branch's history into the _current_ or _checked out_ branch. It is a good idea to make sure your _current_ branch is up to date with _master_ branch, before merging changes into the master branch. Sometimes merging can cause _conflicts_ and to resolve those you can use `git mergetool`.

If you are working with a group of individuals the following commands can be helpful:
 - `git pull` to download changes and merge them directly.
 - `git fetch` to download changes without incorporating them.
 - `git blame <filename>` to see who changed what and when in a given file

## Stashing
[Stashing](https://git-scm.com/book/en/v1/Git-Tools-Stashing) changes translates to temporarily storing away all of your current changes on a stack of unfinished changes that you can go back to reapply at any time. In a way you pause your current work to work on something else, and you can come back later to hit continue. This is helpful with branching as you can be working on one branch, stash your incomplete changes, switch to another branch and begin working on other parts of the project. Later on you can come back and continue your previous work.

- `git stash` will temporarily store all of your current changes.
- `git stash pop` will restore the most recently stashed files.
- `git stash list` will list your stashes.
- `git stash drop` will discard the most recent stash.

## Forget a command, or want to learn more?
I have not covered every nook and cranny of git here, there are other commands that are utilized less frequently but can be important nonetheless. For example, if you are wondering how one would redo a commit, you can look at [this](https://git-scm.com/docs/git-reset) page.

`git help` will list some of the most common git commands and `git help <command>` will provide a man page for the specific command. You can also find detailed documentation on their website: [https://git-scm.com/docs](https://git-scm.com/docs).
