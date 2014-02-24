#pragma once

#include <QObject>

namespace DBM{

   // This object's methods will be available to javascripts running within our 
   // QTWebView. Provides a console.log function to JS. 
   class Console : public QObject {
      Q_OBJECT
      public:
         Console(QObject* parent = 0);

      public slots:
         Q_INVOKABLE void log(QString msg);
   };
};
