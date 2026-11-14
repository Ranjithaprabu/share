
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Search,
  Plus,
  MessageCircle,
  LogOut,
  X,
  Menu,
  Send,
  CheckCheck,
  Users,
  UserPlus,
} from "lucide-react";

import { useNavigate } from "react-router-dom";
import { logout } from "../features/auth/authSlice";
import {
  selectConversation,
  fetchConversations,
  fetchUsers,
} from "../features/conversations/conversationSlice";
import { request } from "../services/api";

function getInitials(name = "") {
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function formatTime(date) {
  if (!date) return "";

  return new Date(date).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function Avatar({ conversation, small = false }) {
  return (
    <div
      className={`avatar ${conversation.color || "violet"} ${
        small ? "avatar-small" : ""
      }`}
    >
      {conversation.avatar || getInitials(conversation.name)}
    </div>
  );
}

export default function Chat() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const user = useSelector((state) => state.auth.user);
  const token = useSelector((state) => state.auth.token);

  const {
    items,
    users,
    activeId,
    loading,
    usersLoading,
    error,
  } = useSelector((state) => state.conversations);

  const active = items.find((item) => item.id === activeId);

  const [query, setQuery] = useState("");
  const [userQuery, setUserQuery] = useState("");
  const [message, setMessage] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("direct");

  const [groupName, setGroupName] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);

  const [mobileSidebar, setMobileSidebar] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState("");

  const [messages, setMessages] = useState([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [messagesError, setMessagesError] = useState("");

  const [sending, setSending] = useState(false);

  // Load conversations and registered users.
  useEffect(() => {
    dispatch(fetchConversations());
    dispatch(fetchUsers());
  }, [dispatch]);

  // Load actual messages whenever the selected conversation changes.
  useEffect(() => {
    if (!activeId || !token) {
      setMessages([]);
      return;
    }

    let cancelled = false;

    const loadMessages = async () => {
      try {
        setMessagesLoading(true);
        setMessagesError("");
        setMessages([]);

        const result = await request(
          `/messages/${activeId}`,
          token
        );

        if (cancelled) return;

        const currentUserId = String(user?.id);

        const formattedMessages = (result.messages || []).map((item) => {
          const senderId = String(
            item.sender?._id || item.sender?.id || item.sender
          );

          return {
            id: item._id,
            sender: senderId === currentUserId ? "me" : "them",
            text: item.content,
            time: formatTime(item.createdAt),
          };
        });

        setMessages(formattedMessages);
      } catch (error) {
        if (!cancelled) {
          setMessagesError(error.message || "Could not load messages");
        }
      } finally {
        if (!cancelled) {
          setMessagesLoading(false);
        }
      }
    };

    loadMessages();

    return () => {
      cancelled = true;
    };
  }, [activeId, token, user?.id]);

  const filteredConversations = useMemo(
    () =>
      items.filter((item) =>
        item.name?.toLowerCase().includes(query.toLowerCase())
      ),
    [items, query]
  );

  const existingMemberIds = useMemo(() => {
    if (modalMode !== "addMembers" || !active) return [];

    return (active.participants || []).map((participant) =>
      String(
        participant.user?._id ||
        participant.user?.id ||
        participant.user
      )
    );
  }, [modalMode, active]);

  const filteredUsers = useMemo(() => {
    return users.filter((item) => {
      const matchesSearch =
        item.name?.toLowerCase().includes(userQuery.toLowerCase()) ||
        item.email?.toLowerCase().includes(userQuery.toLowerCase());

      const notAlreadyMember =
        modalMode !== "addMembers" ||
        !existingMemberIds.includes(String(item._id));

      return matchesSearch && notAlreadyMember;
    });
  }, [users, userQuery, modalMode, existingMemberIds]);

  const isGroupAdmin =
    active?.type === "group" &&
    (active.participants || []).some(
      (participant) =>
        String(
          participant.user?._id ||
          participant.user?.id ||
          participant.user
        ) === String(user?.id) &&
        participant.role === "admin"
    );

  function openModal(mode) {
    setModalMode(mode);
    setShowModal(true);
    setUserQuery("");
    setGroupName("");
    setSelectedUsers([]);
    setActionError("");
  }

  function closeModal() {
    setShowModal(false);
    setUserQuery("");
    setGroupName("");
    setSelectedUsers([]);
    setActionError("");
  }

  function toggleUserSelection(userId) {
    setSelectedUsers((previous) =>
      previous.includes(userId)
        ? previous.filter((id) => id !== userId)
        : [...previous, userId]
    );
  }

  // Create or open a direct conversation.
  async function handleStartConversation(selectedUser) {
    try {
      setActionLoading(true);
      setActionError("");

      const result = await request("/conversations/direct", token, {
        method: "POST",
        body: JSON.stringify({
          receiverId: selectedUser._id,
        }),
      });

      await dispatch(fetchConversations()).unwrap();

      dispatch(selectConversation(result.conversation._id));

      closeModal();
      setMobileSidebar(false);
    } catch (error) {
      setActionError(error.message || "Could not start conversation");
    } finally {
      setActionLoading(false);
    }
  }

  // Create a group.
  async function handleCreateGroup(event) {
    event.preventDefault();

    if (!groupName.trim()) {
      setActionError("Please enter a group name.");
      return;
    }

    if (selectedUsers.length < 2) {
      setActionError("Select at least two other members.");
      return;
    }

    try {
      setActionLoading(true);
      setActionError("");

      const result = await request("/conversations/group", token, {
        method: "POST",
        body: JSON.stringify({
          name: groupName.trim(),
          memberIds: selectedUsers,
        }),
      });

      await dispatch(fetchConversations()).unwrap();

      dispatch(selectConversation(result.conversation._id));

      closeModal();
      setMobileSidebar(false);
    } catch (error) {
      setActionError(error.message || "Could not create group");
    } finally {
      setActionLoading(false);
    }
  }

  // Add members to an existing group.
  async function handleAddMembers(event) {
    event.preventDefault();

    if (!active || selectedUsers.length === 0) {
      setActionError("Select at least one member.");
      return;
    }

    try {
      setActionLoading(true);
      setActionError("");

      await request(
        `/conversations/${active.id}/members`,
        token,
        {
          method: "POST",
          body: JSON.stringify({
            memberIds: selectedUsers,
          }),
        }
      );

      await dispatch(fetchConversations()).unwrap();

      dispatch(selectConversation(active.id));

      closeModal();
    } catch (error) {
      setActionError(error.message || "Could not add members");
    } finally {
      setActionLoading(false);
    }
  }

  // Send a real message to the backend.
  async function submitMessage(event) {
    event.preventDefault();

    const content = message.trim();

    if (!content || !active || sending) return;

    try {
      setSending(true);
      setMessagesError("");

      const result = await request("/messages", token, {
        method: "POST",
        body: JSON.stringify({
          conversationId: active.id,
          content,
        }),
      });

      const savedMessage = result.message;

      setMessages((previous) => [
        ...previous,
        {
          id: savedMessage._id,
          sender: "me",
          text: savedMessage.content,
          time: formatTime(savedMessage.createdAt),
        },
      ]);

      setMessage("");

      dispatch(fetchConversations());
    } catch (error) {
      setMessagesError(error.message || "Message could not be sent");
    } finally {
      setSending(false);
    }
  }

  function signOut() {
    dispatch(logout());
    navigate("/login");
  }

  return (
    <main className="chat-app">
      {/* SIDEBAR */}
      <aside className={`sidebar ${mobileSidebar ? "sidebar-open" : ""}`}>
        <div className="sidebar-top">
          <div className="brand">
            <span className="brand-mark">
              <MessageCircle size={20} />
            </span>{" "}
            connectly
          </div>

          <button
            className="icon-button mobile-close"
            onClick={() => setMobileSidebar(false)}
            aria-label="Close menu"
          >
            <X size={19} />
          </button>
        </div>

        <div className="sidebar-heading">
          <div>
            <span className="eyebrow">MESSAGES</span>
            <h2>
              Inbox <span className="inbox-count">{items.length}</span>
            </h2>
          </div>

          <button
            className="new-chat-button"
            onClick={() => openModal("direct")}
            title="New conversation"
          >
            <Plus size={19} />
          </button>
        </div>

        <div className="search-box">
          <Search size={17} />
          <input
            placeholder="Search conversations"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>

        <div className="filter-row">
          <button className="filter-active">All messages</button>
        </div>

        <div className="conversation-list">
          {loading && (
            <p className="empty-search">Loading conversations...</p>
          )}

          {!loading && error && (
            <p className="empty-search">{error}</p>
          )}

          {!loading &&
            !error &&
            filteredConversations.map((item) => (
              <button
                key={item.id}
                className={`conversation-item ${
                  activeId === item.id ? "conversation-active" : ""
                }`}
                onClick={() => {
                  dispatch(selectConversation(item.id));
                  setMobileSidebar(false);
                }}
              >
                <div className="avatar-wrap">
                  <Avatar conversation={item} />
                </div>

                <div className="conversation-info">
                  <div className="conversation-title">
                    <strong>{item.name}</strong>
                    <span>{item.time}</span>
                  </div>

                  <div className="conversation-preview">
                    <span>
                      {item.type === "group" ? "Group" : "Direct message"}
                    </span>
                  </div>
                </div>
              </button>
            ))}

          {!loading && !error && filteredConversations.length === 0 && (
            <p className="empty-search">
              {items.length === 0
                ? "No conversations yet. Start a new chat!"
                : "No conversations found."}
            </p>
          )}
        </div>

        <div className="sidebar-profile">
          <div className="avatar profile-avatar">
            {getInitials(user?.name || "You")}
          </div>

          <div className="profile-info">
            <strong>{user?.name || "Your profile"}</strong>
            <span>Available</span>
          </div>

          <button className="icon-button" onClick={signOut} title="Sign out">
            <LogOut size={18} />
          </button>
        </div>
      </aside>

      {/* NEW CHAT / GROUP MODAL */}
      {showModal && (
        <div className="modal-backdrop" onClick={closeModal}>
          <div
            className="new-chat-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="modal-heading">
              <div>
                <span className="eyebrow">
                  {modalMode === "direct"
                    ? "NEW MESSAGE"
                    : modalMode === "group"
                      ? "NEW GROUP"
                      : "GROUP MEMBERS"}
                </span>

                <h3>
                  {modalMode === "direct"
                    ? "Start a conversation"
                    : modalMode === "group"
                      ? "Create a group"
                      : "Add members"}
                </h3>
              </div>

              <button
                className="icon-button"
                onClick={closeModal}
                aria-label="Close"
              >
                <X size={19} />
              </button>
            </div>

            {modalMode !== "addMembers" && (
              <div className="filter-row">
                <button
                  className={modalMode === "direct" ? "filter-active" : ""}
                  onClick={() => {
                    setModalMode("direct");
                    setSelectedUsers([]);
                    setActionError("");
                  }}
                >
                  Direct chat
                </button>

                <button
                  className={modalMode === "group" ? "filter-active" : ""}
                  onClick={() => {
                    setModalMode("group");
                    setSelectedUsers([]);
                    setActionError("");
                  }}
                >
                  <Users size={14} /> Create group
                </button>
              </div>
            )}

            {modalMode === "group" && (
              <div className="search-box">
                <Users size={17} />
                <input
                  placeholder="Enter group name"
                  value={groupName}
                  onChange={(event) => setGroupName(event.target.value)}
                  maxLength={50}
                />
              </div>
            )}

            {modalMode === "addMembers" && (
              <p className="muted">
                Select the registered users you want to add to {active?.name}.
              </p>
            )}

            <div className="search-box">
              <Search size={17} />
              <input
                placeholder="Search registered users"
                value={userQuery}
                onChange={(event) => setUserQuery(event.target.value)}
              />
            </div>

            {actionError && (
              <p className="empty-search">{actionError}</p>
            )}

            <div className="conversation-list">
              {usersLoading && (
                <p className="empty-search">Loading registered users...</p>
              )}

              {!usersLoading &&
                filteredUsers.map((registeredUser) => {
                  const selected = selectedUsers.includes(
                    registeredUser._id
                  );

                  if (modalMode === "direct") {
                    return (
                      <button
                        key={registeredUser._id}
                        className="conversation-item"
                        disabled={actionLoading}
                        onClick={() =>
                          handleStartConversation(registeredUser)
                        }
                      >
                        <div className="avatar-wrap">
                          <Avatar
                            conversation={{
                              name: registeredUser.name,
                              color: "violet",
                            }}
                          />
                        </div>

                        <div className="conversation-info">
                          <div className="conversation-title">
                            <strong>{registeredUser.name}</strong>
                          </div>
                          <div className="conversation-preview">
                            <span>{registeredUser.email}</span>
                          </div>
                        </div>

                        {actionLoading && (
                          <span className="muted">Opening...</span>
                        )}
                      </button>
                    );
                  }

                  return (
                    <button
                      key={registeredUser._id}
                      type="button"
                      className={`conversation-item ${
                        selected ? "conversation-active" : ""
                      }`}
                      onClick={() =>
                        toggleUserSelection(registeredUser._id)
                      }
                    >
                      <div className="avatar-wrap">
                        <Avatar
                          conversation={{
                            name: registeredUser.name,
                            color: "violet",
                          }}
                        />
                      </div>

                      <div className="conversation-info">
                        <div className="conversation-title">
                          <strong>{registeredUser.name}</strong>
                        </div>
                        <div className="conversation-preview">
                          <span>{registeredUser.email}</span>
                        </div>
                      </div>

                      <span>{selected ? "✓" : "+"}</span>
                    </button>
                  );
                })}

              {!usersLoading && filteredUsers.length === 0 && (
                <p className="empty-search">
                  {users.length === 0
                    ? "No other registered users found."
                    : "No matching users found."}
                </p>
              )}
            </div>

            {modalMode !== "direct" && (
              <form
                onSubmit={
                  modalMode === "group"
                    ? handleCreateGroup
                    : handleAddMembers
                }
              >
                <p className="muted">
                  {selectedUsers.length} member(s) selected
                </p>

                <button
                  type="submit"
                  className="send-button"
                  disabled={actionLoading || selectedUsers.length === 0}
                >
                  {actionLoading
                    ? "Please wait..."
                    : modalMode === "group"
                      ? "Create group"
                      : "Add members"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* MAIN CHAT */}
      <section className="chat-main">
        {active ? (
          <>
            <header className="chat-header">
              <button
                className="icon-button mobile-menu"
                onClick={() => setMobileSidebar(true)}
                aria-label="Open menu"
              >
                <Menu size={20} />
              </button>

              <Avatar conversation={active} small />

              <div className="chat-contact">
                <strong>{active.name}</strong>
                <span>
                  {active.type === "group"
                    ? `${active.participants?.length || 0} members`
                    : "Direct message"}
                </span>
              </div>

              {active.type === "group" && isGroupAdmin && (
                <div className="header-actions">
                  <button
                    className="icon-button"
                    title="Add group members"
                    onClick={() => openModal("addMembers")}
                  >
                    <UserPlus size={19} />
                  </button>
                </div>
              )}
            </header>

            <div className="message-area">
              <div className="date-divider">
                <span>TODAY</span>
              </div>

              {messagesLoading && (
                <p className="empty-search">Loading messages...</p>
              )}

              {messagesError && (
                <p className="empty-search">{messagesError}</p>
              )}

              {!messagesLoading &&
                !messagesError &&
                messages.map((item) => (
                  <div
                    key={item.id}
                    className={`message-row ${
                      item.sender === "me" ? "message-mine" : ""
                    }`}
                  >
                    {item.sender !== "me" && (
                      <Avatar conversation={active} small />
                    )}

                    <div className="message-content">
                      <div className="message-bubble">{item.text}</div>
                      <div className="message-meta">
                        {item.time}{" "}
                        {item.sender === "me" && (
                          <CheckCheck size={14} />
                        )}
                      </div>
                    </div>
                  </div>
                ))}

              {!messagesLoading &&
                !messagesError &&
                messages.length === 0 && (
                  <p className="empty-search">
                    No messages yet. Send the first message!
                  </p>
                )}
            </div>

            <div className="chat-bottom">
              <div className="quick-reply">
                <span className="quick-dot" /> You're chatting with{" "}
                {active.name}
              </div>

              <form className="message-composer" onSubmit={submitMessage}>
                <input
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  placeholder="Write a message..."
                  disabled={sending}
                />

                <button
                  type="submit"
                  className="send-button"
                  disabled={!message.trim() || sending}
                  aria-label="Send message"
                >
                  <Send size={18} />
                </button>
              </form>

              <p className="composer-hint">
                Press <kbd>Enter</kbd> to send
              </p>
            </div>
          </>
        ) : (
          <div className="empty-chat">
            <MessageCircle size={42} />
            <h2>Your conversations, all in one place</h2>
            <p>
              {loading
                ? "Loading your conversations..."
                : "Select a conversation or start a new chat."}
            </p>

            <button
              className="new-chat-button"
              onClick={() => openModal("direct")}
            >
              <Plus size={18} /> New conversation
            </button>
          </div>
        )}
      </section>
    </main>
  );
}
