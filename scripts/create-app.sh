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


if [ -d "app" ]; then
   read -p "WAIT! There is already an app directory, if you continue you will overwrite it. Do you want to continue? [Ny]" -n 1 -r
   if [[ ! $REPLY =~ ^[Yy]$ ]]; then
      exit
   fi
fi

echo -e "\n..."

# Delete old app directory, create new one
rm -rf app
cp -f -R dbm/templates/app app

# Fix symlinks in app dir
cd app/html/scripts
rm -f dbm
ln -s ../../../dbm/library/dancing-bone-machine/html dbm
cd ../../../
cd app/pd
rm -f dbm
ln -s ../../dbm/library/dancing-bone-machine/pd/externals/bin dbm

echo -e "Done."
