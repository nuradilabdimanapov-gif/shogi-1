/**
 * Shogi Web - Player Account & Rating (ELO / Dan-Kyu) System
 */

export class AccountManager {
  constructor() {
    this.currentUser = null;
    this.accounts = {};
    this.loadAccounts();
  }

  loadAccounts() {
    try {
      const stored = localStorage.getItem('shogi_accounts');
      if (stored) {
        this.accounts = JSON.parse(stored);
      }
      const activeUser = localStorage.getItem('shogi_current_user');
      if (activeUser && this.accounts[activeUser]) {
        this.currentUser = this.accounts[activeUser];
      }
    } catch (e) {
      if (typeof console !== 'undefined' && console.warn) {
        console.warn('Could not read accounts from localStorage:', e);
      }
    }
  }

  saveAccounts() {
    try {
      localStorage.setItem('shogi_accounts', JSON.stringify(this.accounts));
      if (this.currentUser) {
        localStorage.setItem('shogi_current_user', this.currentUser.username);
      } else {
        localStorage.removeItem('shogi_current_user');
      }
    } catch (e) {
      if (typeof console !== 'undefined' && console.warn) {
        console.warn('Could not save accounts to localStorage:', e);
      }
    }
  }

  isLoggedIn() {
    return this.currentUser !== null;
  }

  getCurrentUser() {
    return this.currentUser;
  }

  register(username, password) {
    username = (username || '').trim();
    if (!username || username.length < 2) {
      return { success: false, error: 'Username must be at least 2 characters long.' };
    }
    if (this.accounts[username]) {
      return { success: false, error: 'Username already exists. Please choose another or sign in.' };
    }

    const newUser = {
      username,
      password: password || '1234',
      rating: 1200,
      peakRating: 1200,
      wins: 0,
      losses: 0,
      draws: 0,
      createdAt: new Date().toISOString()
    };

    this.accounts[username] = newUser;
    this.currentUser = newUser;
    this.saveAccounts();

    // Async sync to server
    this.syncToServer(newUser);

    return { success: true, user: newUser };
  }

  login(username, password) {
    username = (username || '').trim();
    const user = this.accounts[username];
    if (!user) {
      return { success: false, error: 'User not found. Please register first.' };
    }
    if (password && user.password && user.password !== password) {
      return { success: false, error: 'Incorrect password.' };
    }

    this.currentUser = user;
    this.saveAccounts();
    return { success: true, user };
  }

  logout() {
    this.currentUser = null;
    this.saveAccounts();
  }

  // Calculate Shogi Dan/Kyu Rank from ELO rating
  getRank(rating = null) {
    const r = rating !== null ? rating : (this.currentUser ? this.currentUser.rating : 1200);

    if (r < 1000) return { titleEn: '15-Kyu', titleJa: '15級', badge: 'Novice' };
    if (r < 1100) return { titleEn: '10-Kyu', titleJa: '10級', badge: 'Apprentice' };
    if (r < 1200) return { titleEn: '8-Kyu', titleJa: '8級', badge: 'Junior' };
    if (r < 1300) return { titleEn: '6-Kyu', titleJa: '6級', badge: 'Intermediate' };
    if (r < 1400) return { titleEn: '4-Kyu', titleJa: '4級', badge: 'Tactician' };
    if (r < 1500) return { titleEn: '2-Kyu', titleJa: '2級', badge: 'Senior' };
    if (r < 1600) return { titleEn: '1-Kyu', titleJa: '1級', badge: 'Expert' };
    if (r < 1700) return { titleEn: '1-Dan (Shodan)', titleJa: '初段', badge: 'Dan Master' };
    if (r < 1800) return { titleEn: '2-Dan', titleJa: '二段', badge: 'Dan Master' };
    if (r < 1900) return { titleEn: '3-Dan', titleJa: '三段', badge: 'High Master' };
    if (r < 2000) return { titleEn: '4-Dan', titleJa: '四段', badge: 'High Master' };
    return { titleEn: '5-Dan Grandmaster', titleJa: '五段 (師範)', badge: 'Grandmaster' };
  }

  // Update ELO rating after a game:
  // outcome: 1.0 (win), 0.5 (draw), 0.0 (loss)
  updateGameResult(outcome, opponentRating = 1200) {
    if (!this.currentUser) return null;

    const user = this.currentUser;
    const oldRating = user.rating;

    // Expected score formula: E = 1 / (1 + 10 ^ ((R_opp - R_user) / 400))
    const expected = 1 / (1 + Math.pow(10, (opponentRating - oldRating) / 400));
    const kFactor = 32;
    const delta = Math.round(kFactor * (outcome - expected));

    user.rating = Math.max(100, oldRating + delta);
    user.peakRating = Math.max(user.peakRating || oldRating, user.rating);

    if (outcome === 1.0) {
      user.wins = (user.wins || 0) + 1;
    } else if (outcome === 0.0) {
      user.losses = (user.losses || 0) + 1;
    } else {
      user.draws = (user.draws || 0) + 1;
    }

    this.saveAccounts();
    this.syncToServer(user);

    return {
      oldRating,
      newRating: user.rating,
      delta,
      rank: this.getRank(user.rating)
    };
  }

  // Sync to backend REST API
  async syncToServer(user) {
    try {
      if (typeof fetch === 'function') {
        await fetch('/api/accounts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(user)
        });
      }
    } catch (e) {
      // Offline / sandboxed fallback is completely fine
    }
  }
}
