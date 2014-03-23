#include <iostream>
#include <QFileDialog>
#include <QTextStream>

#include "File.h"

DBM::File::File(QObject* parent): QObject(parent){}

void DBM::File::showDialog(QString caption, QString filter, bool openOrSave, int callbackId){
   QString path;
   if(openOrSave){
      path = QFileDialog::getOpenFileName(0, caption, QString(), filter);
   }
   else{
      path = QFileDialog::getSaveFileName(0, caption, QString(), filter);
   }

   if(path.isEmpty()){
      emit errorCallback(callbackId+1, QString());
   }
   else{
      QVariantMap params;
      params["path"] = QVariant(path);
      emit okCallback(callbackId, params);
   }
}

void DBM::File::writeFile(QString path, QString data, int callbackId){
   QFile file(path);
   if(file.open(QFile::WriteOnly)){
      QTextStream out(&file);
      out << data;  
      file.close();

      QVariantMap params;
      emit okCallback(callbackId, params);
   }
   else{
      emit errorCallback(callbackId+1, QString());
   }
}

void DBM::File::readFile(QString path, int callbackId){
   QFile file(path);
   if(file.open(QFile::ReadOnly)){
      QTextStream in(&file);
      QString data = in.readLine();
      file.close();

      QVariantMap params;
      params["data"] = data;
      emit okCallback(callbackId, params);
   }
   else{
      emit errorCallback(callbackId+1, QString());
   }
}
