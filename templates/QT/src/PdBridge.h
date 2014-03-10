#pragma once

#include <QObject>
#include <QVariantMap>
#include "WebPage.h"
#include "Audio.h"

namespace DBM{
   class PdBridge: public QObject, public pd::PdReceiver{
      Q_OBJECT

      public:
         explicit PdBridge(QObject* parent = 0);
         virtual ~PdBridge();
         void setPage(WebPage* page);

         // PdReceiver methods:
         void print(const std::string& message);

      protected:
         WebPage* page;
         Audio* audio;

      signals:
         // To tell JS to execute a success callback, do fireOKCallback(cbID, params),
         // to execute an error callback, do fireErrorCallback(cbID+1, params).
         void fireOKCallback(int callbackID, QVariantMap params);
         void fireErrorCallback(int callbackID, QString msg);

      public slots: 
         void configurePlayback(int sampleRate, int numberChannels, bool inputEnabled, bool mixingEnabled, int callbackId);
         void openFile(QString path, QString fileName, int callbackId);
         void setActive(bool active);
         void sendBang(QString receiver);
         void sendNoteOn(int channel, int pitch, int velocity);
         void sendFloat(float num, QString receiver);
   };
};
