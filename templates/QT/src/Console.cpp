#include "Console.h"
#include <iostream>

DBM::Console::Console(QObject* parent): QObject(parent){}

void DBM::Console::log(QString msg){
   std::cout << qPrintable(msg) << std::endl;
}
