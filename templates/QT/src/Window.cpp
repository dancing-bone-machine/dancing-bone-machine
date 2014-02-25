/**
 helloHTML A C++ example program that uses Webkit, html, css and javascript 
 code as a GUI.

 Copyright (C) 2012 Rafael Vega
 
 This program is free software: you can redistribute it and/or modify
 it under the terms of the GNU General Public License as published by
 the Free Software Foundation, either version 3 of the License, or
 (at your option) any later version.
 
 This program is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU General Public License for more details.
 
 You should have received a copy of the GNU General Public License
 along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/ 

#include <iostream>
#include <QWebFrame>
#include <QApplication>
#include "Window.h"
#include "WebPage.h"

// Constructor
DBM::Window::Window(int width, int height, QString htmlFilePath, PdBridge* brdg, QObject* parent):
QObject(parent),
width(width),
height(height),
htmlFilePath(htmlFilePath),
bridge(brdg)
{
   console = new Console(this);

   window = new QMainWindow();
   window->setMaximumSize(width, height);
   window->setMinimumSize(width, height);

   webView = new QWebView(window);
   WebPage* page = new WebPage(webView);
   page->settings()->setAttribute(QWebSettings::LocalStorageEnabled, true);
   webView->setPage(page);
   connectToJS();
   connect( webView->page()->mainFrame(), SIGNAL(javaScriptWindowObjectCleared()), this, SLOT(connectToJS()) );
   webView->resize(width, height);
   webView->load(QUrl(htmlFilePath));

   bridge->setPage(page);

   window->show();
};

DBM::Window::~Window(){
   delete window;
}

/**
 * Exposes this class to the javascript code.
 */
void DBM::Window::connectToJS(){
   webView->page()->mainFrame()->addToJavaScriptWindowObject(QString("QT"), bridge);
   webView->page()->mainFrame()->addToJavaScriptWindowObject(QString("console"), console);
}
