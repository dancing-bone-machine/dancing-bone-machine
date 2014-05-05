#pragma once

#include <QObject>
#include <QVariant>

namespace DBM{

   // This object's methods will be available to javascripts running within our 
   // QTWebView. Provides a way to interface with the filesystem to JS. 
   class File : public QObject {
      Q_OBJECT
      public:
         File(QObject* parent = 0);

      signals:
         // To tell JS to execute a success callback, do emit fireOKCallback(cbID, params),
         // to execute an error callback, do emit fireErrorCallback(cbID+1, params).
         void okCallback(int callbackID, QVariantMap params);
         void errorCallback(int callbackID, QString msg);

      public slots:
         void showDialog(QString caption, QString filter, bool openOrSave, int callbackId);
         void writeFile(QString path, QString data, int callbackId);
         void readFile(QString path, int callbackId);
   };
};
