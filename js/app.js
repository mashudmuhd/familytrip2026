/**
 * KAATTIKE KUTTIKAL COUSINS TRIP 2026 - APPLICATION LOGIC
 */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Lucide Icons
  if (window.lucide) {
    window.lucide.createIcons();
  }

  // State: Default age type is null so user must select an age group
  let members = [
    {
      id: generateId(),
      name: '',
      type: null // null initially: 'adult', 'kid8to15', or 'kidBelow8'
    }
  ];

  let lastSubmission = null;

  // DOM Elements
  const membersContainer = document.getElementById('membersContainer');
  const addMemberBtn = document.getElementById('addMemberBtn');
  const totalCountDisplay = document.getElementById('totalCountDisplay');
  const adultCountDisplay = document.getElementById('adultCountDisplay');
  const kid8to15CountDisplay = document.getElementById('kid8to15CountDisplay');
  const kidBelow8CountDisplay = document.getElementById('kidBelow8CountDisplay');
  const memberCountBadge = document.getElementById('memberCountBadge');
  const tripRegistrationForm = document.getElementById('tripRegistrationForm');
  const phoneNumberInput = document.getElementById('phoneNumberInput');
  const submitBtn = document.getElementById('submitBtn');
  const valStatusBadge = document.getElementById('validationStatusBadge');
  const valStatusIcon = document.getElementById('valStatusIcon');
  const valStatusText = document.getElementById('valStatusText');

  // Modal Elements
  const successModal = document.getElementById('successModal');
  const modalCloseBtn = document.getElementById('modalCloseBtn');
  const shareWhatsappBtn = document.getElementById('shareWhatsappBtn');
  const copySummaryBtn = document.getElementById('copySummaryBtn');
  const copyBtnText = document.getElementById('copyBtnText');
  const soundToggleBtn = document.getElementById('soundToggleBtn');
  const soundIcon = document.getElementById('soundIcon');
  const soundLabel = document.getElementById('soundLabel');
  const viewRegisteredBtn = document.getElementById('viewRegisteredBtn');

  // Load Saved Draft or Submission from LocalStorage
  loadStateFromStorage();

  // Initial Render & State Sync
  renderMembers();
  updateStats();
  updateSubmitButtonState();

  /* ==========================================================================
     MEMBER MANAGEMENT & RENDERING
     ========================================================================== */

  function generateId() {
    return 'm_' + Math.random().toString(36).substr(2, 9);
  }

  function renderMembers() {
    membersContainer.innerHTML = '';

    members.forEach((member, index) => {
      const card = createMemberCardElement(member, index);
      membersContainer.appendChild(card);
    });

    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  function createMemberCardElement(member, index) {
    const card = document.createElement('div');
    card.className = 'member-card';
    card.dataset.id = member.id;

    const isAdult = member.type === 'adult';
    const isKid8to15 = member.type === 'kid8to15';
    const isKidBelow8 = member.type === 'kidBelow8';

    card.innerHTML = `
      <div class="member-card-header">
        <div class="member-title-group">
          <div class="member-number-badge">${index + 1}</div>
          <span class="member-label">MEMBER ${index + 1}</span>
        </div>
        ${members.length > 1 ? `
          <button type="button" class="delete-member-btn" title="Delete member" aria-label="Delete member ${index + 1}">
            <i data-lucide="trash-2"></i>
          </button>
        ` : ''}
      </div>

      <div class="input-wrapper">
        <input 
          type="text" 
          class="custom-input member-name-input" 
          placeholder="പേര് നൽകുക (e.g. Rahul, Sneha, Baby Nila...)" 
          value="${escapeHtml(member.name)}"
          maxlength="50"
          autocomplete="off"
        >
      </div>

      <div class="member-type-selector">
        <!-- Option 1: Adult (15+) -->
        <div class="type-toggle-btn ${isAdult ? 'active-adult' : ''}" data-type="adult">
          <div class="type-icon-wrapper">
            <i data-lucide="${isAdult ? 'check-circle-2' : 'user'}"></i>
          </div>
          <div class="type-text-group">
            <span class="type-title">മുതിർന്നവർ (Adult)</span>
            <span class="type-subtitle">15 വയസ്സിന് മുകളിൽ</span>
          </div>
        </div>

        <!-- Option 2: Kid (8-15 Years) -->
        <div class="type-toggle-btn ${isKid8to15 ? 'active-kid8to15' : ''}" data-type="kid8to15">
          <div class="type-icon-wrapper">
            <i data-lucide="${isKid8to15 ? 'check-circle-2' : 'smile'}"></i>
          </div>
          <div class="type-text-group">
            <span class="type-title">കുട്ടി (8-15 Yrs)</span>
            <span class="type-subtitle">8 - 15 വയസ്സ്</span>
          </div>
        </div>

        <!-- Option 3: Kid (<8 Years) -->
        <div class="type-toggle-btn ${isKidBelow8 ? 'active-kidBelow8' : ''}" data-type="kidBelow8">
          <div class="type-icon-wrapper">
            <i data-lucide="${isKidBelow8 ? 'check-circle-2' : 'baby'}"></i>
          </div>
          <div class="type-text-group">
            <span class="type-title">കുട്ടി (&lt;8 Yrs)</span>
            <span class="type-subtitle">&lt;8 വയസ്സിന് താഴെ</span>
          </div>
        </div>
      </div>
    `;

    // Event: Name input change
    const nameInput = card.querySelector('.member-name-input');
    nameInput.addEventListener('input', (e) => {
      member.name = e.target.value;
      if (member.name.trim().length >= 2) {
        clearFieldInvalid(nameInput);
      }
      updateSubmitButtonState();
      saveDraftToStorage();
    });

    // Event: Delete button
    const deleteBtn = card.querySelector('.delete-member-btn');
    if (deleteBtn) {
      deleteBtn.addEventListener('click', () => {
        removeMember(member.id, card);
      });
    }

    // Event: Toggle Type (Adult / 8-15 / Below 8)
    const toggleBtns = card.querySelectorAll('.type-toggle-btn');
    toggleBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const selectedType = btn.dataset.type;
        if (member.type !== selectedType) {
          member.type = selectedType;
          if (window.soundManager) window.soundManager.playToggle();
          updateCardTypeUI(card, selectedType);
          updateStats();

          // Clear global adult error if satisfied
          if (members.some(m => m.type === 'adult')) {
            document.querySelectorAll('.member-card.card-error').forEach(c => {
              if (c.querySelectorAll('.input-invalid').length === 0) {
                c.classList.remove('card-error');
              }
            });
          }

          updateSubmitButtonState();
          saveDraftToStorage();
        }
      });
    });

    return card;
  }

  function updateCardTypeUI(card, type) {
    const adultBtn = card.querySelector('[data-type="adult"]');
    const kid8to15Btn = card.querySelector('[data-type="kid8to15"]');
    const kidBelow8Btn = card.querySelector('[data-type="kidBelow8"]');

    if (adultBtn) adultBtn.className = `type-toggle-btn ${type === 'adult' ? 'active-adult' : ''}`;
    if (kid8to15Btn) kid8to15Btn.className = `type-toggle-btn ${type === 'kid8to15' ? 'active-kid8to15' : ''}`;
    if (kidBelow8Btn) kidBelow8Btn.className = `type-toggle-btn ${(type === 'kidBelow8' || type === 'kid') ? 'active-kidBelow8' : ''}`;

    // Refresh icons inside buttons
    if (adultBtn) {
      const adultIconWrapper = adultBtn.querySelector('.type-icon-wrapper');
      adultIconWrapper.innerHTML = `<i data-lucide="${type === 'adult' ? 'check-circle-2' : 'user'}"></i>`;
    }

    if (kid8to15Btn) {
      const kid8to15IconWrapper = kid8to15Btn.querySelector('.type-icon-wrapper');
      kid8to15IconWrapper.innerHTML = `<i data-lucide="${type === 'kid8to15' ? 'check-circle-2' : 'smile'}"></i>`;
    }

    if (kidBelow8Btn) {
      const kidBelow8IconWrapper = kidBelow8Btn.querySelector('.type-icon-wrapper');
      kidBelow8IconWrapper.innerHTML = `<i data-lucide="${(type === 'kidBelow8' || type === 'kid') ? 'check-circle-2' : 'baby'}"></i>`;
    }

    if (window.lucide) window.lucide.createIcons();
  }

  function addMember() {
    const newMember = {
      id: generateId(),
      name: '',
      type: null // null initially so user must choose age
    };
    members.push(newMember);

    if (window.soundManager) window.soundManager.playPop();

    renderMembers();
    updateStats();
    updateSubmitButtonState();
    saveDraftToStorage();

    // Focus on the newly added member input
    setTimeout(() => {
      const inputs = membersContainer.querySelectorAll('.member-name-input');
      if (inputs.length > 0) {
        const lastInput = inputs[inputs.length - 1];
        lastInput.focus();
        lastInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 50);

    showToast('പുതിയ അംഗത്തെ ചേർത്തു (Member added)', 'success');
  }

  function removeMember(memberId, cardElement) {
    if (members.length <= 1) {
      showToast('കുറഞ്ഞത് ഒരാളെങ്കിലും വേണം! (Minimum 1 member required)', 'error');
      return;
    }

    if (window.soundManager) window.soundManager.playTrash();

    cardElement.classList.add('removing');

    setTimeout(() => {
      members = members.filter(m => m.id !== memberId);
      renderMembers();
      updateStats();
      updateSubmitButtonState();
      saveDraftToStorage();
      showToast('അംഗത്തെ നീക്കം ചെയ്തു (Member removed)', 'success');
    }, 320);
  }

  /* ==========================================================================
     STATS & COUNTERS
     ========================================================================== */

  function updateStats() {
    const totalCount = members.length;
    const adultCount = members.filter(m => m.type === 'adult').length;
    const kid8to15Count = members.filter(m => m.type === 'kid8to15').length;
    const kidBelow8Count = members.filter(m => m.type === 'kidBelow8' || m.type === 'kid').length;

    if (totalCountDisplay) animateCount(totalCountDisplay, totalCount);
    if (adultCountDisplay) animateCount(adultCountDisplay, adultCount);
    if (kid8to15CountDisplay) animateCount(kid8to15CountDisplay, kid8to15Count);
    if (kidBelow8CountDisplay) animateCount(kidBelow8CountDisplay, kidBelow8Count);

    // Update section summary badge
    const personText = totalCount === 1 ? '1 Person' : `${totalCount} Persons`;
    if (memberCountBadge) memberCountBadge.textContent = personText;
  }

  function animateCount(element, targetValue) {
    const currentValue = parseInt(element.textContent, 10) || 0;
    if (currentValue === targetValue) return;

    element.classList.remove('number-pop');
    void element.offsetWidth; // trigger reflow
    element.classList.add('number-pop');

    let start = currentValue;
    const duration = 250;
    const startTime = performance.now();

    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const current = Math.round(start + (targetValue - start) * progress);
      element.textContent = current;

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        element.textContent = targetValue;
      }
    }

    requestAnimationFrame(update);
  }

  /* ==========================================================================
     VALIDATION & SUBMIT BUTTON STATE MANAGEMENT
     ========================================================================== */

  function setFieldInvalid(inputElement, errorMessage) {
    if (!inputElement) return;
    inputElement.classList.remove('input-invalid', 'shake-error');
    void inputElement.offsetWidth; // trigger reflow for animation
    inputElement.classList.add('input-invalid', 'shake-error');

    const wrapper = inputElement.closest('.input-wrapper');
    if (wrapper) {
      let errDiv = wrapper.querySelector('.input-error-msg');
      if (!errDiv) {
        errDiv = document.createElement('div');
        errDiv.className = 'input-error-msg';
        wrapper.appendChild(errDiv);
      }
      errDiv.innerHTML = `<i data-lucide="alert-circle"></i><span>${escapeHtml(errorMessage)}</span>`;
      if (window.lucide) window.lucide.createIcons();
    }

    const card = inputElement.closest('.member-card');
    if (card) {
      card.classList.add('card-error');
    }
  }

  function clearFieldInvalid(inputElement) {
    if (!inputElement) return;
    inputElement.classList.remove('input-invalid', 'shake-error');

    const wrapper = inputElement.closest('.input-wrapper');
    if (wrapper) {
      const errDiv = wrapper.querySelector('.input-error-msg');
      if (errDiv) errDiv.remove();
    }

    const card = inputElement.closest('.member-card');
    if (card) {
      const remainingErrors = card.querySelectorAll('.input-invalid');
      if (remainingErrors.length === 0) {
        card.classList.remove('card-error');
      }
    }
  }

  function clearAllErrors() {
    document.querySelectorAll('.input-invalid').forEach(el => el.classList.remove('input-invalid', 'shake-error'));
    document.querySelectorAll('.input-error-msg').forEach(el => el.remove());
    document.querySelectorAll('.member-card.card-error').forEach(el => el.classList.remove('card-error'));
  }

  /**
   * Real-time check: Enable Submit button ONLY when all names and ages are filled
   */
  function updateSubmitButtonState() {
    if (!submitBtn) return;

    const unfilledNames = members.filter(m => !m.name || m.name.trim().length < 2);
    const unselectedAges = members.filter(m => !m.type);
    const adultCount = members.filter(m => m.type === 'adult').length;
    const rawPhone = phoneNumberInput ? phoneNumberInput.value.trim() : '';
    const phoneDigits = rawPhone.replace(/[^0-9]/g, '');
    const isPhoneInvalid = rawPhone.length > 0 && phoneDigits.length < 10;

    let isReady = false;
    let statusMsg = '';

    if (unfilledNames.length > 0 && unselectedAges.length > 0) {
      statusMsg = 'തുടരാൻ പേരും പ്രായവും നൽകുക (Enter name & select age)';
    } else if (unfilledNames.length > 0) {
      statusMsg = 'എല്ലാ അംഗങ്ങളുടെയും പേര് നൽകുക (Enter all member names)';
    } else if (unselectedAges.length > 0) {
      statusMsg = 'എല്ലാ അംഗങ്ങളുടെയും പ്രായം തിരഞ്ഞെടുക്കുക (Select age for all members)';
    } else if (adultCount === 0) {
      statusMsg = 'കുറഞ്ഞത് 1 മുതിർന്ന ആളെയെങ്കിലും (Adult 15+) ചേർക്കുക';
    } else if (isPhoneInvalid) {
      statusMsg = 'ശരിയായ 10 അക്ക ഫോൺ നമ്പർ നൽകുക (Valid phone required)';
    } else {
      isReady = true;
      statusMsg = '✅ സമർപ്പിക്കാൻ തയ്യാറാണ്! (Ready to Submit)';
    }

    if (isReady) {
      submitBtn.disabled = false;
      submitBtn.classList.remove('btn-disabled');
      submitBtn.classList.add('ready-glow');
      if (valStatusBadge) {
        valStatusBadge.classList.add('status-ready');
        if (valStatusText) valStatusText.textContent = statusMsg;
        if (valStatusIcon) valStatusIcon.setAttribute('data-lucide', 'check-circle-2');
      }
    } else {
      submitBtn.disabled = true;
      submitBtn.classList.add('btn-disabled');
      submitBtn.classList.remove('ready-glow');
      if (valStatusBadge) {
        valStatusBadge.classList.remove('status-ready');
        if (valStatusText) valStatusText.textContent = statusMsg;
        if (valStatusIcon) valStatusIcon.setAttribute('data-lucide', 'alert-circle');
      }
    }

    if (window.lucide) window.lucide.createIcons();
  }

  /* ==========================================================================
     EVENT LISTENERS
     ========================================================================== */

  addMemberBtn.addEventListener('click', addMember);

  // Sound Toggle Button
  soundToggleBtn.addEventListener('click', () => {
    if (window.soundManager) {
      const isEnabled = window.soundManager.toggle();
      if (isEnabled) {
        soundIcon.setAttribute('data-lucide', 'volume-2');
        soundLabel.textContent = 'Sound On';
        showToast('ശബ്ദം ഓൺ ചെയ്തു (Sound Enabled)', 'success');
      } else {
        soundIcon.setAttribute('data-lucide', 'volume-x');
        soundLabel.textContent = 'Muted';
        showToast('ശബ്ദം ഓഫാക്കി (Sound Muted)', 'success');
      }
      if (window.lucide) window.lucide.createIcons();
    }
  });

  // View Saved Ticket Pass
  viewRegisteredBtn.addEventListener('click', () => {
    const saved = localStorage.getItem('cousins_trip_2026_submission');
    if (saved) {
      const data = JSON.parse(saved);
      showSuccessModal(data);
    } else {
      showToast('നിങ്ങൾ ഇതുവരെ രജിസ്ട്രേഷൻ പൂർത്തിയാക്കിയിട്ടില്ല!', 'error');
    }
  });

  // Phone Number formatting & Auto-save
  phoneNumberInput.addEventListener('input', (e) => {
    let val = e.target.value.replace(/[^0-9+\s-]/g, '');
    e.target.value = val;
    clearFieldInvalid(phoneNumberInput);
    updateSubmitButtonState();
    saveDraftToStorage();
  });

  // Form Submission
  tripRegistrationForm.addEventListener('submit', handleFormSubmit);

  function handleFormSubmit(e) {
    e.preventDefault();
    clearAllErrors();

    let hasError = false;
    let firstErrorElement = null;
    let errorToastMessage = '';

    // Check 1: Empty members list
    if (!members || members.length === 0) {
      showToast('കുറഞ്ഞത് ഒരാളെങ്കിലും വേണം! (Minimum 1 member required)', 'error');
      if (window.soundManager) window.soundManager.playError();
      return;
    }

    // Check 2: Member Names & Age Validation
    const seenNames = new Map();
    members.forEach((m, idx) => {
      const card = membersContainer.children[idx];
      const nameInput = card ? card.querySelector('.member-name-input') : null;
      const cleanName = (m.name || '').trim();

      if (!cleanName) {
        hasError = true;
        if (nameInput) {
          setFieldInvalid(nameInput, 'പേര് രേഖപ്പെടുത്തുക (Name required)');
          if (!firstErrorElement) firstErrorElement = nameInput;
        }
        if (!errorToastMessage) {
          errorToastMessage = 'എല്ലാ അംഗങ്ങളുടെയും പേര് നൽകുക! (Please enter names for all members)';
        }
      } else if (cleanName.length < 2) {
        hasError = true;
        if (nameInput) {
          setFieldInvalid(nameInput, 'കുറഞ്ഞത് 2 അക്ഷരങ്ങൾ വേണം (Min 2 characters)');
          if (!firstErrorElement) firstErrorElement = nameInput;
        }
        if (!errorToastMessage) {
          errorToastMessage = 'പേരിൽ കുറഞ്ഞത് 2 അക്ഷരങ്ങൾ ഉണ്ടായിരിക്കണം!';
        }
      } else {
        const lower = cleanName.toLowerCase();
        if (seenNames.has(lower)) {
          hasError = true;
          if (nameInput) {
            setFieldInvalid(nameInput, 'ഒരേ പേര് ആവർത്തിക്കരുത് (Duplicate name)');
            if (!firstErrorElement) firstErrorElement = nameInput;
          }
          const prevInput = seenNames.get(lower);
          if (prevInput) {
            setFieldInvalid(prevInput, 'ഒരേ പേര് ആവർത്തിക്കരുത് (Duplicate name)');
          }
          if (!errorToastMessage) {
            errorToastMessage = 'ഒരേ പേര് ഒന്നിലധികം തവണ നൽകാൻ സാധിക്കില്ല!';
          }
        } else {
          seenNames.set(lower, nameInput);
        }
      }

      // Check if age type is selected
      if (!m.type) {
        hasError = true;
        if (card) card.classList.add('card-error');
        if (!firstErrorElement && card) firstErrorElement = card;
        if (!errorToastMessage) {
          errorToastMessage = 'എല്ലാ അംഗങ്ങളുടെയും പ്രായം തിരഞ്ഞെടുക്കുക (Select age category)';
        }
      }
    });

    // Check 3: At least 1 Adult Required
    const adultCount = members.filter(m => m.type === 'adult').length;
    if (adultCount === 0) {
      hasError = true;
      document.querySelectorAll('.member-card').forEach(c => c.classList.add('card-error'));
      if (!firstErrorElement) {
        firstErrorElement = membersContainer.firstElementChild;
      }
      if (!errorToastMessage) {
        errorToastMessage = '⚠️ കുറഞ്ഞത് ഒരു മുതിർന്ന ആളെയെങ്കിലും (Adult 15+) ഉൾപ്പെടുത്തണം!';
      }
    }

    // Check 4: Phone Number format validation (if provided)
    const rawPhone = phoneNumberInput.value.trim();
    if (rawPhone) {
      const digits = rawPhone.replace(/[^0-9]/g, '');
      if (digits.length < 10) {
        hasError = true;
        setFieldInvalid(phoneNumberInput, 'ശരിയായ 10 അക്ക മൊബൈൽ നമ്പർ നൽകുക (Enter 10-digit number)');
        if (!firstErrorElement) firstErrorElement = phoneNumberInput;
        if (!errorToastMessage) {
          errorToastMessage = 'ശരിയായ 10 അക്ക ഫോൺ നമ്പർ നൽകുക! (Invalid phone number)';
        }
      }
    }

    // IF ANY VALIDATION FAILED: STRICTLY PREVENT SUBMISSION
    if (hasError) {
      if (submitBtn) {
        submitBtn.classList.remove('btn-shake');
        void submitBtn.offsetWidth;
        submitBtn.classList.add('btn-shake');
      }

      if (window.soundManager) window.soundManager.playError();
      if (errorToastMessage) showToast(errorToastMessage, 'error');

      if (firstErrorElement) {
        firstErrorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        if (typeof firstErrorElement.focus === 'function') {
          firstErrorElement.focus();
        }
      }
      return; // Stop execution completely
    }

    // ALL VALID: Proceed with registration
    const totalCount = members.length;
    const kid8to15Count = members.filter(m => m.type === 'kid8to15').length;
    const kidBelow8Count = members.filter(m => m.type === 'kidBelow8' || m.type === 'kid').length;

    const submissionData = {
      ticketId: 'CK-' + Math.floor(1000 + Math.random() * 9000),
      timestamp: new Date().toISOString(),
      familyHead: members[0].name.trim(),
      totalCount,
      adultCount,
      kid8to15Count,
      kidBelow8Count,
      kidCount: kid8to15Count + kidBelow8Count,
      phone: rawPhone || 'Not Provided',
      membersList: members.map(m => ({
        name: m.name.trim(),
        type: m.type === 'kid' ? 'kidBelow8' : m.type
      }))
    };

    // Save to LocalStorage
    lastSubmission = submissionData;
    localStorage.setItem('cousins_trip_2026_submission', JSON.stringify(submissionData));

    // Audio & Confetti Celebration
    if (window.soundManager) window.soundManager.playSuccess();
    triggerCelebrationConfetti();

    // Show Boarding Pass Modal
    showSuccessModal(submissionData);
    showToast('രജിസ്ട്രേഷൻ വിജയകരമായി പൂർത്തിയായി! 🎉', 'success');
  }

  /* ==========================================================================
     SUCCESS MODAL & WHATSAPP SHARING
     ========================================================================== */

  function showSuccessModal(data) {
    document.getElementById('ticketIdDisplay').textContent = '#' + data.ticketId;
    document.getElementById('ticketLeaderName').textContent = data.familyHead;
    document.getElementById('ticketPhone').textContent = data.phone;
    document.getElementById('ticketTotalMembers').textContent = data.totalCount + ' Persons';

    const kid8to15 = data.kid8to15Count || 0;
    const kidBelow8 = data.kidBelow8Count !== undefined ? data.kidBelow8Count : (data.kidCount || 0);
    document.getElementById('ticketBreakdown').textContent = `${data.adultCount} Adults • ${kid8to15} Kids (8-15) • ${kidBelow8} Kids (<8)`;

    // Populate Member Chips
    const chipsContainer = document.getElementById('ticketMemberChips');
    chipsContainer.innerHTML = '';
    data.membersList.forEach(m => {
      const chip = document.createElement('span');
      let chipClass = 'chip-adult';
      let icon = '👤';
      let typeLabel = 'Adult';

      if (m.type === 'kid8to15') {
        chipClass = 'chip-kid8to15';
        icon = '🎒';
        typeLabel = '8-15 Yrs';
      } else if (m.type === 'kidBelow8' || m.type === 'kid') {
        chipClass = 'chip-kidBelow8';
        icon = '👶';
        typeLabel = '<8 Yrs';
      }

      chip.className = `member-chip ${chipClass}`;
      chip.innerHTML = `${icon} ${escapeHtml(m.name)} <small>(${typeLabel})</small>`;
      chipsContainer.appendChild(chip);
    });

    successModal.classList.add('active');
    document.body.style.overflow = 'hidden';

    if (window.lucide) window.lucide.createIcons();
  }

  modalCloseBtn.addEventListener('click', () => {
    successModal.classList.remove('active');
    document.body.style.overflow = '';
  });

  successModal.addEventListener('click', (e) => {
    if (e.target === successModal) {
      successModal.classList.remove('active');
      document.body.style.overflow = '';
    }
  });

  // Safe cross-device clipboard copier with fallback
  function copyTextToClipboard(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text);
    }
    return new Promise((resolve, reject) => {
      try {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        const successful = document.execCommand('copy');
        textArea.remove();
        if (successful) resolve();
        else reject(new Error('Copy command failed'));
      } catch (err) {
        reject(err);
      }
    });
  }

  // Share to WhatsApp Group Link
  shareWhatsappBtn.addEventListener('click', () => {
    if (!lastSubmission) {
      const saved = localStorage.getItem('cousins_trip_2026_submission');
      if (saved) lastSubmission = JSON.parse(saved);
    }
    if (!lastSubmission) return;

    const message = generateWhatsAppMessage(lastSubmission);
    const groupUrl = 'https://chat.whatsapp.com/DvSm1WrEayALujp2dGq87d?mode=gi_t';

    copyTextToClipboard(message)
      .then(() => {
        showToast('മെസ്സേജ് കോപ്പി ചെയ്തു! ഗ്രൂപ്പിൽ Paste ചെയ്യുക', 'success');
      })
      .catch(() => {})
      .finally(() => {
        window.open(groupUrl, '_blank');
      });
  });

  // Copy Summary Details
  copySummaryBtn.addEventListener('click', () => {
    if (!lastSubmission) {
      const saved = localStorage.getItem('cousins_trip_2026_submission');
      if (saved) lastSubmission = JSON.parse(saved);
    }
    if (!lastSubmission) return;

    const message = generateWhatsAppMessage(lastSubmission);
    copyTextToClipboard(message)
      .then(() => {
        copyBtnText.textContent = 'Copied! ✓';
        showToast('വിവരങ്ങൾ കോപ്പി ചെയ്തു (Details copied)', 'success');
        setTimeout(() => {
          copyBtnText.textContent = 'Copy Details';
        }, 2500);
      })
      .catch(() => {
        showToast('Copy failed, please copy manually', 'error');
      });
  });

  function generateWhatsAppMessage(data) {
    const kid8to15 = data.kid8to15Count || 0;
    const kidBelow8 = data.kidBelow8Count !== undefined ? data.kidBelow8Count : (data.kidCount || 0);

    const lines = [
      '🌴 *കാട്ടിലെ കുട്ടികൾ COUSINS TRIP 2026* 🌴',
      '─────────────────────────',
      `*Pass ID:* #${data.ticketId}`,
      `*കുടുംബനാഥൻ (Contact):* ${data.familyHead}`,
    ];

    if (data.phone && data.phone !== 'Not Provided' && data.phone.trim() !== '') {
      lines.push(`*Phone / WhatsApp:* ${data.phone}`);
    }

    lines.push('');
    lines.push(`*ആകെ അംഗങ്ങൾ (Total Members):* ${data.totalCount}`);
    lines.push(`• മുതിർന്നവർ (Adults 15+): ${data.adultCount}`);
    lines.push(`• കുട്ടികൾ (8-15 വയസ്സ്): ${kid8to15}`);
    lines.push(`• കുട്ടികൾ (8 വയസ്സിൽ താഴെ): ${kidBelow8}`);

    lines.push('');
    lines.push('*അംഗങ്ങളുടെ വിവരങ്ങൾ (Members List):*');
    data.membersList.forEach((m, idx) => {
      let typeLabel = 'Adult (15+)';
      if (m.type === 'kid8to15') typeLabel = 'Kid (8-15 Yrs)';
      else if (m.type === 'kidBelow8' || m.type === 'kid') typeLabel = 'Kid (<8 Yrs)';
      lines.push(`${idx + 1}. *${m.name}* - ${typeLabel}`);
    });

    lines.push('');
    lines.push('*Status:* Confirmed (രജിസ്ട്രേഷൻ പൂർത്തിയായി) ✅');
    lines.push('─────────────────────────');

    return lines.join('\n');
  }

  /* ==========================================================================
     CONFETTI CANNON CELEBRATION
     ========================================================================== */

  function triggerCelebrationConfetti() {
    if (typeof confetti !== 'function') return;

    // Center burst
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });

    // Left cannon
    setTimeout(() => {
      confetti({
        particleCount: 50,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.7 }
      });
    }, 150);

    // Right cannon
    setTimeout(() => {
      confetti({
        particleCount: 50,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.7 }
      });
    }, 300);
  }

  /* ==========================================================================
     LOCAL STORAGE STORAGE HELPERS
     ========================================================================== */

  function saveDraftToStorage() {
    const draft = {
      members,
      phone: phoneNumberInput.value
    };
    localStorage.setItem('cousins_trip_2026_draft', JSON.stringify(draft));
  }

  function loadStateFromStorage() {
    try {
      const draft = localStorage.getItem('cousins_trip_2026_draft');
      if (draft) {
        const parsed = JSON.parse(draft);
        if (parsed.members && parsed.members.length > 0) {
          members = parsed.members;
        }
        if (parsed.phone) {
          phoneNumberInput.value = parsed.phone;
        }
      }

      const savedSub = localStorage.getItem('cousins_trip_2026_submission');
      if (savedSub) {
        lastSubmission = JSON.parse(savedSub);
      }
    } catch (e) {
      console.warn("Could not load draft", e);
    }
  }

  /* ==========================================================================
     TOAST NOTIFICATIONS
     ========================================================================== */

  function showToast(message, type = 'success') {
    const toastContainer = document.getElementById('toastContainer');
    if (!toastContainer) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    const iconName = type === 'success' ? 'check-circle' : 'alert-circle';
    toast.innerHTML = `
      <i data-lucide="${iconName}" class="toast-icon"></i>
      <span>${escapeHtml(message)}</span>
    `;

    toastContainer.appendChild(toast);
    if (window.lucide) window.lucide.createIcons();

    setTimeout(() => {
      toast.style.animation = 'toastOut 0.3s ease forwards';
      setTimeout(() => {
        toast.remove();
      }, 300);
    }, 3200);
  }

  function escapeHtml(text) {
    if (!text) return '';
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.toString().replace(/[&<>"']/g, m => map[m]);
  }
});
