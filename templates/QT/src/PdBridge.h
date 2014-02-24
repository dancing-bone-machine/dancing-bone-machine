#pragma once

#include <QObject>
#include <QVariantMap>
#include "WebPage.h"

namespace DBM{
   class PdBridge: public QObject{
      Q_OBJECT

      public:
         explicit PdBridge(QObject* parent = 0);
         void setPage(WebPage* page);

      protected:
         WebPage* page;

      signals:
         void fireCallback(QString callbackID, QVariantMap params);

      public slots: 
         // Q_INVOKABLE void configurePlayback(int sampleRate, int numberChannels, bool inputEnabled, bool mixingEnabled, QString callback);
         // Q_INVOKABLE void configurePlayback(QString callback);
         void configurePlayback(int sampleRate, int numberChannels, bool inputEnabled, bool mixingEnabled, QString callbackOK, QString callbackErr);


   };
};
