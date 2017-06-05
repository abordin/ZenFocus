import path from 'path';
import { app, BrowserWindow } from 'electron';
import settings from 'electron-settings';
import { installExtensions, setWindowSize } from './electron/utils';
import buildMenu from './electron/menu';
import updater from './electron/updater';

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

if (
  process.env.NODE_ENV === 'development' ||
  process.env.DEBUG_PROD === 'true'
) {
  require('electron-debug')();
  const p = path.join(__dirname, '..', 'app', 'node_modules');
  require('module').globalPaths.push(p);
}

let mainWindow = null;

app.on('window-all-closed', () => {
  app.quit();
});

app.on('ready', async () => {
  if (
    process.env.NODE_ENV === 'development' ||
    process.env.DEBUG_PROD === 'true'
  ) {
    await installExtensions();
  }

  const isCompact = settings.get('system.compact');

  mainWindow = new BrowserWindow({
    show: false,
    titleBarStyle: 'hidden-inset',
    icon: path.join(__dirname, '../resources/icons/64x64.png')
  });

  mainWindow.loadURL(`file://${__dirname}/app.html`);

  // @TODO: Use 'ready-to-show' event
  //        https://github.com/electron/electron/blob/master/docs/api/browser-window.md#using-ready-to-show-event
  mainWindow.webContents.on('did-finish-load', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    mainWindow.show();
    mainWindow.focus();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  setWindowSize(mainWindow, isCompact);
  buildMenu(mainWindow);
  updater(mainWindow);
});
