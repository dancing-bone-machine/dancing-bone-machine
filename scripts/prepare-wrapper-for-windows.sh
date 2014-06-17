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

echo -e "\n..."

if [[ "$OS" =~ Windows ]]; then
	cd app/wrappers/desktop
	cmd //c del app
	cmd //c del vendors
	cmd //c mklink //J app ..\\..\\
	cmd //c mklink //J vendors ..\\..\\..\\dbm\\library\\vendors
	cd ../../../

	cd app/html/scripts
	cmd //c del dbm
	cmd //c mklink //J dbm ..\\..\\..\\dbm\\library\\dancing-bone-machine\\html
	cd ../../../
fi

echo -e "Done."
