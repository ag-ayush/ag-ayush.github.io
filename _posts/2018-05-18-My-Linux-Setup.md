---
layout: post
title: "My Linux Setup"
date: 2018-05-18
excerpt: "I picked up Linux as my daily driver when I started college, nearly a year ago. Coding and using tools such as git felt much more natural on Linux than they ever did on Windows. After a few months of getting used to Linux, I decided to explore customizing Linux, and this blog explores the outcome."
image: "/images/setup.jpg"
---
## Distro
My current Linux distro is [Ubuntu 18.04](http://releases.ubuntu.com/18.04/). Ubuntu has a large community, making it much easier for first time Linux users to learn. Additionally, it is heavily supported throughout different applications, and the advanced packaging tool or `apt` is a great tool. I do sometimes find myself wanting the power of `yaourt` from Arch, however the last time I tried installing Arch I did not succeed in making my Wi-Fi card work with it. Nonetheless, I will be trying to install it again in future, hopefully with more knowledge on the subject.

## Design
Blue is one of my favorite colors. I thoroughly enjoyed _Tron: Legacy_. And, I find the Arc-theme very beautiful. As a result my setup is based around those three concepts.

I am currently using [i3-gaps](https://github.com/Airblader/i3) as my Window Manager, with [polybar](https://github.com/jaagr/polybar) for my top bar. In addition to this, I use [Font Awesome](https://fontawesome.com/), which allows for the icons on the window titles in polybar.

Before continuing I should mention that all my configuration files can be found on  [GitHub](https://github.com/ag-ayush/dotfiles). This also includes an install script that can be used on Ubuntu 16.04+ to install and configure everything automatically.

### Background
<span class="image fit"><img src="{{ "/images/background.jpg" | absolute_url }}" alt="" /></span>

### Terminal
I currently use [terminator](https://launchpad.net/terminator) as my terminal. This can be seen in the first image running [cli-visualizer](https://github.com/dpayne/cli-visualizer) and `pipes.sh`.

I also use [oh-my-zsh](https://github.com/robbyrussell/oh-my-zsh) instead of bash. The reason is that zsh allows auto-complete when typing in a path or a command and it has themes that integrate git into it, making the terminal much more useful. I am currently using [Bureau](https://github.com/robbyrussell/oh-my-zsh/blob/master/themes/bureau.zsh-theme) theme.

### Application Launcher
I am currently using [rofi](https://github.com/DaveDavenport/rofi) as my application launcher. It is easy to configure via the command line. It does not have a configuration file of its own, but the configuration can be seen on the i3 config file. It is the command that is executed when Super + D is pressed. My configuration:
<span class="image fit"><img src="{{ "/images/rofi.png" | absolute_url }}" alt="" /></span>

### Nautilus
Once again, Arc theme for icons and for the GTK theme. I found `gnome-tweaks` and `unity-tweak-tool` to fail at changing the default theme when using i3, however `lxappearence` was successful.
<span class="image fit"><img src="{{ "/images/nautilus.jpg" | absolute_url }}" alt="" /></span>

### Installing
On a fresh install of Ubuntu, you can run `bash <(curl -Ls https://raw.githubusercontent.com/ag-ayush/dotfiles/master/t470/install.sh)` to install everything I currently have onto your computer.
