export const navbarHtml = `
  <li class="nav-item d-block" id="signup-holder"></li>
  <li class="nav-item d-none" id="mypage-holder"></li>
  <li class="nav-item d-block" id="login-holder"></li>
  <li class="nav-item d-none" id="logout-holder">
    <form id="logout-form"><button type="submit">Logout</button></form>
  </li>
`;

export const loginFormHtml = `
  <form id="login-form" novalidate>
    <input type="email" id="email" required>
    <div class="invalid-feedback"></div>
    <input type="password" id="password" required>
    <div class="invalid-feedback"></div>
    <button type="submit">Login</button>
  </form>
`;

export const signupFormHtml = `
  <form id="signup-form" novalidate>
    <input type="email" id="email" required>
    <div class="invalid-feedback"></div>
    <input type="password" id="password" minlength="8" required>
    <div class="invalid-feedback"></div>
    <input type="password" id="password-confirmation" minlength="8" required>
    <div class="invalid-feedback"></div>
    <input type="text" id="username" required>
    <div class="invalid-feedback"></div>
    <input type="radio" name="rank" id="rank-premium" value="premium" checked>
    <input type="radio" name="rank" id="rank-normal" value="normal">
    <input type="text" id="address">
    <input type="tel" id="tel">
    <select id="gender"><option value="0">0</option></select>
    <input type="date" id="birthday">
    <input type="checkbox" id="notification">
    <button type="submit">Sign up</button>
  </form>
`;

export const plansPageHtml = `
  ${navbarHtml}
  <div id="plan-list"></div>
`;

export const reservePageHtml = `
  <h4 id="plan-name"></h4>
  <p id="plan-desc"></p>
  <form id="reserve-form" novalidate>
    <div class="form-group">
      <input type="text" class="needs-calc" id="date" required>
      <div class="invalid-feedback"></div>
    </div>
    <div class="form-group">
      <input type="number" class="needs-calc" id="term" required>
      <div class="invalid-feedback"></div>
    </div>
    <div class="form-group">
      <input type="number" class="needs-calc" id="head-count" required>
      <div class="invalid-feedback"></div>
    </div>
    <input type="checkbox" class="needs-calc" id="breakfast">
    <input type="checkbox" class="needs-calc" id="early-check-in">
    <input type="checkbox" class="needs-calc" id="sightseeing">
    <input type="text" id="username" required>
    <select id="contact" required>
      <option value="no">None</option>
      <option value="email">Email</option>
      <option value="tel">Tel</option>
    </select>
    <div class="form-group d-block">
      <input type="email" id="email" disabled>
      <div class="invalid-feedback"></div>
    </div>
    <div class="form-group d-block">
      <input type="tel" id="tel" pattern="[0-9]{11}" disabled>
      <div class="invalid-feedback"></div>
    </div>
    <textarea id="comment"></textarea>
    <input type="hidden" id="plan-id-hidden">
    <input type="hidden" id="plan-name-hidden">
    <input type="hidden" id="room-bill-hidden">
    <output id="total-bill">-</output>
    <button type="submit" id="submit-button" disabled>Submit</button>
    <div id="room-info"></div>
  </form>
`;

export const mypageHtml = `
  <h2><span id="icon-holder"></span></h2>
  <p id="email"></p>
  <p id="username"></p>
  <p id="rank"></p>
  <p id="address"></p>
  <p id="tel"></p>
  <p id="gender"></p>
  <p id="birthday"></p>
  <p id="notification"></p>
  <a id="icon-link" class="disabled" tabindex="-1" aria-disabled="true">Icon</a>
  <form id="delete-form"><button type="submit" disabled>Delete</button></form>
  <form id="logout-form"><button type="submit">Logout</button></form>
`;

export const confirmPageHtml = `
  <h3 id="total-bill"></h3>
  <h4 id="plan-name"></h4>
  <p id="plan-desc"></p>
  <dd id="term"></dd>
  <dd id="head-count"></dd>
  <dd id="plans"></dd>
  <dd id="username"></dd>
  <dd id="contact"></dd>
  <pre id="comment"></pre>
  <div id="success-modal"></div>
`;

export const iconPageHtml = `
  <form id="icon-form" novalidate>
    <input type="file" id="icon" accept="image/*" required>
    <div class="invalid-feedback"></div>
    <input type="range" id="zoom" min="0" max="100" value="100" disabled>
    <input type="color" id="color" value="#ffffff" disabled>
    <div id="icon-holder"></div>
    <button type="submit">Save</button>
  </form>
  <form id="logout-form"><button type="submit">Logout</button></form>
`;

export function mountHtml(html) {
  document.body.innerHTML = html;
}
