#!/bin/bash

# Copyright (c) 2013 Rafael Vega González <rvega@elsoftwarehamuerto.org>
# 
# This file is part of Dancing Bone Machine.
# 
# Dancing Bone Machine is free software; you can redistribute it and/or modify it under
# the terms of the GNU Lesser General Public License as published by
# the Free Software Foundation; either version 3 of the License, or
# (at your option) any later version.
# 
# Dancing Bone Machine is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU Lesser General Public License for more details.
# 
# You should have received a copy of the GNU Lesser General Public License
# along with this program.  If not, see <http://www.gnu.org/licenses/>.


if [ -d "app/wrappers/desktop" ]; then
   read -p "WAIT! A Desktop wrapper already exists, if you continue you will overwrite it. Do you want to continue? [Ny]" -n 1 -r
   if [[ ! $REPLY =~ ^[Yy]$ ]]; then
      exit
   fi
fi

echo -e "\n..."

if [[ "$OS" =~ Windows ]]; then
	rm -rf dbm/templates/desktop/app
	rm -rf dbm/templates/desktop/vendors
	cmd //c rmdir app\\wrappers\\desktop
	cmd //c xcopy //E dbm\\templates\\desktop app\\wrappers\\desktop
	cd app/wrappers/desktop
	cmd //c rmdir app
	cmd //c rmdir vendors
	cmd //c mklink //J app ..\\..\\
	cmd //c mklink //J vendors ..\\..\\..\\dbm\\library\\vendors
else 
	rm -rf app/wrappers/desktop
	cp -f -R dbm/templates/desktop app/wrappers/desktop
	cd app/wrappers/desktop
	rm -f app
	rm -f vendors
	ln -s ../.. app
	ln -s ../../../dbm/library/vendors vendors
fi

echo -e "Done."
