/**
 TO-DO: license text

 Copyright (C) 2014 Rafael Vega
*/ 
#include <QApplication>
#include "Window.h"
#include "PdBridge.h"

int main(int argv, char **args) {
   QApplication app(argv, args);

   DBM::PdBridge* bridge = new DBM::PdBridge(&app);

   QString path = "file://" + QApplication::applicationDirPath() + "/res/html/index.html";
   new DBM::Window(450, 600, path, bridge, &app);
   
   return app.exec();
}
