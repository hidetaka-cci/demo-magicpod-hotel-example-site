import {getSessionUser, setLoginNavbar} from './lib/session.js';

$(() => {
  // Check login
  const session = getSessionUser();
  if (session) {
    setLoginNavbar();
  }
});
