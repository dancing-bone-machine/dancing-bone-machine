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


if [ -d "app/wrappers/ios" ]; then
   read -p "WAIT! An iOS wrapper already exists, if you continue you will overwrite it. Do you want to continue? [Ny]" -n 1 -r
   if [[ ! $REPLY =~ ^[Yy]$ ]]; then
      exit
   fi
fi

echo -e "\n..."

rm -rf app/wrappers/ios
cp -f -R dbm/templates/apache-cordova/platforms/ios app/wrappers/ios

cd app/wrappers/ios

rm libpd
ln -s ../../../dbm/library/vendors/pd-for-ios/libpd 

rm pd
ln -s ../../pd 

rm pd-abstractions
ln -s ../../../dbm/library/dancing-bone-machine/pd/externals/bin pd-abstractions 

rm www
ln -s ../../html www

echo -e "Done."
