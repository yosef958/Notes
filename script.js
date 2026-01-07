document.addEventListener("DOMContentLoaded", function () {
  const notesContainer = document.getElementById("notesContainer");
  const addNoteBtn = document.getElementById("addNoteBtn");
  const addNoteModal = document.getElementById("addNoteModal");
  const closeModalBtn = document.getElementById("closeModalBtn");
  const noteForm = document.getElementById("noteForm");
  const searchInput = document.getElementById("searchInput");
  const emptyState = document.getElementById("emptyState");
  const confirmModal = document.getElementById("confirmModal");
  const cancelDeleteBtn = document.getElementById("cancelDeleteBtn");
  const confirmDeleteBtn = document.getElementById("confirmDeleteBtn");
  const customSelect = document.getElementById("filterSelect");
  const selected = customSelect.querySelector(".selected");
  const options = customSelect.querySelector(".options");
  const optionItems = customSelect.querySelectorAll(".options li");
  let selectedFilter = "all";
  selected.addEventListener("click", () => {
    options.style.display =
      options.style.display === "block" ? "none" : "block";
  });
  optionItems.forEach(item => {
    item.addEventListener("click", () => {
      selected.innerHTML = item.innerHTML;
      selectedFilter = item.dataset.value;
      options.style.display = "none";
      filterNotes();
    });
  });
  document.addEventListener("click", (e) => {
    if (!customSelect.contains(e.target)) {
      options.style.display = "none";
    }
  });
  let notes = JSON.parse(localStorage.getItem("notes")) || [];
  let noteToDeleteId = null;
  let noteToEditId = null;
  renderNotes();
  updateEmptyState();
  addNoteBtn.addEventListener("click", openAddNoteModal);
  closeModalBtn.addEventListener("click", closeAddNoteModal);
  noteForm.addEventListener("submit", handleNoteSubmit);
  searchInput.addEventListener("input", filterNotes);
  cancelDeleteBtn.addEventListener("click", closeConfirmModal);
  confirmDeleteBtn.addEventListener("click", confirmDeleteNote);
  function renderNotes(notesToRender = notes) {
    notesContainer.innerHTML = "";
    notesToRender.forEach((note, index) => {
      const noteElement = document.createElement("div");
      noteElement.className = "note-card fade-in";
      noteElement.innerHTML = `
        <div class="note-content">
          <div class="note-header">
            <h3 class="note-title">${note.title}</h3>
            <div class="note-actions">
              <button class="edit-btn" data-id="${index}">
                <i class="fas fa-edit"></i>
              </button>
              <button class="delete-btn" data-id="${index}">
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </div>
          <p class="note-text">${note.content}</p>
          <div class="note-footer">
            <span class="note-tag ${getTagClass(note.tag)}">
              ${getTagIcon(note.tag)} ${getTagName(note.tag)}
            </span>
            <span class="note-date">${formatDate(note.date)}</span>
          </div>
        </div>
      `;
      notesContainer.appendChild(noteElement);
    });
    document.querySelectorAll(".delete-btn").forEach(btn => {
      btn.addEventListener("click", function () {
        noteToDeleteId = parseInt(this.dataset.id);
        openConfirmModal();
      });
    });
    document.querySelectorAll(".edit-btn").forEach(btn => {
      btn.addEventListener("click", function () {
        noteToEditId = parseInt(this.dataset.id);
        const note = notes[noteToEditId];

        document.getElementById("noteTitle").value = note.title;
        document.getElementById("noteContent").value = note.content;
        document.querySelector(
          `input[name="noteTag"][value="${note.tag}"]`
        ).checked = true;
        openAddNoteModal();
      });
    });
  }
  function handleNoteSubmit(e) {
    e.preventDefault();
    const title = document.getElementById("noteTitle").value;
    const content = document.getElementById("noteContent").value;
    const tag = document.querySelector(
      'input[name="noteTag"]:checked'
    ).value;
    if (noteToEditId !== null) {
      notes[noteToEditId] = {
        title,
        content,
        tag,
        date: new Date().toISOString(),
      };
      noteToEditId = null;
    } else {
      notes.unshift({
        title,
        content,
        tag,
        date: new Date().toISOString(),
      });
    }
    saveNotes();
    renderNotes();
    closeAddNoteModal();
    updateEmptyState();
    filterNotes();
  }
  function filterNotes() {
    const searchTerm = searchInput.value.toLowerCase();
    let filteredNotes = notes;

    if (searchTerm) {
      filteredNotes = filteredNotes.filter(
        note =>
          note.title.toLowerCase().includes(searchTerm) ||
          note.content.toLowerCase().includes(searchTerm)
      );
    }

    if (selectedFilter !== "all") {
      filteredNotes = filteredNotes.filter(
        note => note.tag === selectedFilter
      );
    }

    renderNotes(filteredNotes);
    updateEmptyState(filteredNotes);
  }

  function confirmDeleteNote() {
    if (noteToDeleteId !== null) {
      notes.splice(noteToDeleteId, 1);
      saveNotes();
      renderNotes();
      filterNotes();
      closeConfirmModal();
    }
  }

  function saveNotes() {
    localStorage.setItem("notes", JSON.stringify(notes));
  }

  function updateEmptyState(list = notes) {
    emptyState.style.display = list.length === 0 ? "block" : "none";
  }

  function openAddNoteModal() {
    addNoteModal.classList.add("active");
    document.body.style.overflow = "hidden";
  }

  function closeAddNoteModal() {
    addNoteModal.classList.remove("active");
    document.body.style.overflow = "auto";
    noteForm.reset();
    noteToEditId = null;
  }

  function openConfirmModal() {
    confirmModal.classList.add("active");
    document.body.style.overflow = "hidden";
  }

  function closeConfirmModal() {
    confirmModal.classList.remove("active");
    document.body.style.overflow = "auto";
    noteToDeleteId = null;
  }

  function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function getTagClass(tag) {
    return {
      work: "tag-work",
      personal: "tag-personal",
      ideas: "tag-ideas",
      reminders: "tag-reminders",
    }[tag] || "";
  }

  function getTagIcon(tag) {
    return {
      work: '<i class="fas fa-briefcase"></i>',
      personal: '<i class="fas fa-user"></i>',
      ideas: '<i class="fas fa-lightbulb"></i>',
      reminders: '<i class="fas fa-bell"></i>',
    }[tag] || "";
  }

  function getTagName(tag) {
    return {
      work: "Work",
      personal: "Personal",
      ideas: "Ideas",
      reminders: "Reminders",
    }[tag] || tag;
  }
});
