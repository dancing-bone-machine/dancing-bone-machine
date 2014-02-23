/**
 TO-DO: license text

 Copyright (C) 2014 Rafael Vega
*/ 
#include <QApplication>
#include "Window.h"
#include "PdBridge.h"

int main(int argv, char **args) {
   QApplication app(argv, args);

   PdBridge bridge;

   QString path = "file://" + QApplication::applicationDirPath() + "/res/html/index.html";
   Window window(800, 600, path);
   window.show();
   
   return app.exec();
}
