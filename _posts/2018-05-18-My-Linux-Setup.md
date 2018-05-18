---
layout: post
title: "My Linux Setup"
date: 2018-05-18
excerpt: "I have used Linux as my daily driver for nearly a year now and with that much time I have been able to create a setup that I find useful and productive in my daily life. This blog post shares that setup, and how to get it for yourself."
image: "/images/setup.jpg"
---
## Distro
My current Linux distribution is [Ubuntu 18.04](http://releases.ubuntu.com/18.04/), merely for Ubuntu's `apt` or Advanced Packaging Tool. I do sometimes find myself wanting the power of `yaourt` from Arch, however the last time I tried installing Arch I did not succeed in making my Wi-Fi card work with it. Nonetheless, I will be trying to install arch again in future, hopefully with more knowledge on the subject.

I am currently using [i3-gaps](https://github.com/Airblader/i3) as my Window Manager, with [polybar](https://github.com/jaagr/polybar) for my top bar.

Before continuing I should mention that all my configuration files can be found on my [GitHub](https://github.com/ag-ayush/dotfiles). This also includes an install script that can be used on Ubuntu 16.04+ to install and configure everything automatically.

## Design
I love the color blue, I thoroughly enjoyed _Tron: Legacy_, and I find the Arc theme very beautiful. As a result my setup is based around those three concepts.

### Background
<span class="image fit"><img src="{{ "/images/background.jpg" | absolute_url }}" alt="" /></span>

### Terminal
I currently use [terminator](https://launchpad.net/terminator) as my terminal. The terminal can be seen in the first image running [cli-visualizer](https://github.com/dpayne/cli-visualizer) and `pipes.sh`.

I also use [oh-my-zsh](https://github.com/robbyrussell/oh-my-zsh) instead of bash. The reason is that zsh allows auto-complete when typing in a path or a command and it has themes that integrate git into it, making the terminal much more useful. I am currently using [Bureau](https://github.com/robbyrussell/oh-my-zsh/blob/master/themes/bureau.zsh-theme) theme.

### Application Launcher
With a wm, you need to have an application launcher. I am currently using [rofi](https://github.com/DaveDavenport/rofi). My configuration:
<span class="image fit"><img src="{{ "/images/rofi.png" | absolute_url }}" alt="" /></span>

### Nautilus
Once again, Arc theme for icons and for the GTK theme.
<span class="image fit"><img src="{{ "/images/nautilus.jpg" | absolute_url }}" alt="" /></span>

### Installing
On a fresh install of Ubuntu, you can run `bash <(curl -Ls https://raw.githubusercontent.com/ag-ayush/dotfiles/master/t470/install.sh)` to install everything I currently have installed onto your computer.
