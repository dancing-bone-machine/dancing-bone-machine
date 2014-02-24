#include "WebPage.h"

DBM::WebPage::WebPage(QObject* parent): QWebPage(parent){}

QString DBM::WebPage::userAgentForUrl(const QUrl &url ) const {
   return QString("DancingBoneMachineQT");
   (void)url;
}
