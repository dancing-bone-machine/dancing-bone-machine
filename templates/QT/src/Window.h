#pragma once

#include <QString>
#include <QMainWindow>
#include <QWebView>
#include "PdBridge.h"
#include "Console.h"

namespace DBM{
   /**
    * The Window Class encapsulates a WebKit web browser to be used as a GUI canvas and 
    * provides an API to communicate to and from the Javascript code running within it.
    */
   class Window: public QObject {
      Q_OBJECT

      public:
         explicit Window(int width, int height, QString htmlFilePath, PdBridge* brdg, QObject* parent = 0);
         virtual ~Window();

      protected:
         int width;
         int height;
         QString htmlFilePath;
         QMainWindow* window;
         QWebView* webView;
         PdBridge* bridge;
         Console* console;

      public slots:
         void connectToJS();
         void download(const QNetworkRequest &request);
         void unsupportedContent(QNetworkReply * reply);
   };
};
