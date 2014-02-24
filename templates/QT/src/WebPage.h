#pragma once

#include <QWebPage>

namespace DBM{
   // Subclass QWebPage so we can change the user agent string
   class WebPage : public QWebPage {
      public:
         WebPage(QObject* parent = 0);

      protected:
         QString userAgentForUrl(const QUrl &url ) const;
   };
};
