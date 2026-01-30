import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { clientAi } from '../services/clientApi';
import { apiErrorMessage, classifyApiError } from '../utils/apiError';
import { ErrorState, SkeletonBlock } from '../components/client-dashboard/ui';

const STORAGE_KEY = 'auditsec_client_ai_conversation_id_v1';

const prettyActionLabel = (approval) => {
  const payload = approval?.action_payload;
  const scanType = payload?.scanType || payload?.scan_type;
  const target = payload?.target || payload?.hostname;
  if (approval?.action_type === 'scan') {
    return `${scanType || 'scan'} • ${target || ''}`.trim();
  }
  return approval?.action_type || 'action';
};

export default function ClientAssistantPage() {
  const [conversations, setConversations] = useState([]);
  const [conversationId, setConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [pending, setPending] = useState([]);
  const [input, setInput] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [renamingId, setRenamingId] = useState(null);
  const [renameValue, setRenameValue] = useState('');
  const [renameSaving, setRenameSaving] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(true);
  const [menuOpenId, setMenuOpenId] = useState(null);
  const [menuPos, setMenuPos] = useState(null);
  const [menuShown, setMenuShown] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const bottomRef = useRef(null);
  const fileInputRef = useRef(null);
  const menuRef = useRef(null);
  const menuAnchorRef = useRef(null);

  const scrollToBottom = () => {
    try {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    } catch {
      // ignore
    }
  };

  const loadApprovals = async () => {
    const approvals = await clientAi.listApprovals('pending');
    setPending(approvals);
  };

  const ensureConversation = async () => {
    const stored = (() => {
      try {
        return Number(localStorage.getItem(STORAGE_KEY));
      } catch {
        return null;
      }
    })();

    if (stored && Number.isFinite(stored)) return stored;

    const convo = await clientAi.createConversation('AuditSec Assistant');
    try {
      localStorage.setItem(STORAGE_KEY, String(convo.id));
    } catch {
      // ignore
    }
    return convo.id;
  };

  const loadConversations = async () => {
    const list = await clientAi.listConversations();
    setConversations(list);
    return list;
  };

  const selectConversation = async (id) => {
    setConversationId(id);
    setRenamingId(null);
    setRenameValue('');
    setMenuOpenId(null);
    try {
      localStorage.setItem(STORAGE_KEY, String(id));
    } catch {
      // ignore
    }
    const msgs = await clientAi.listMessages(id);
    setMessages(msgs);
    setAttachments([]);
    await loadApprovals();
    setTimeout(scrollToBottom, 50);
  };

  const createNewConversation = async () => {
    const convo = await clientAi.createConversation('New conversation');
    await loadConversations();
    await selectConversation(convo.id);
  };

  const startRename = (c) => {
    setRenamingId(Number(c.id));
    setRenameValue((c.title || '').toString());
    setMenuOpenId(null);
  };

  const cancelRename = () => {
    setRenamingId(null);
    setRenameValue('');
  };

  const saveRename = async () => {
    if (!renamingId) return;
    const title = renameValue.trim();
    if (!title) return;
    setRenameSaving(true);
    setError(null);
    try {
      const updated = await clientAi.renameConversation(renamingId, title);
      setConversations((prev) => prev.map((c) => (Number(c.id) === Number(renamingId) ? updated : c)));
      setRenamingId(null);
      setRenameValue('');
    } catch (e) {
      setError(e);
    } finally {
      setRenameSaving(false);
    }
  };

  const togglePinned = async (c) => {
    setError(null);
    try {
      const isPinned = Number(c?.pinned || 0) === 1;
      await clientAi.setConversationPinned(Number(c.id), !isPinned);
      await loadConversations();
    } catch (e) {
      setError(e);
    }
  };

  const deleteConversation = async (c) => {
    const id = Number(c?.id);
    if (!Number.isFinite(id)) return;
    if (!window.confirm('Supprimer cette conversation ? Cette action est irréversible.')) return;

    setError(null);
    try {
      await clientAi.deleteConversation(id);
      const list = await loadConversations();

      if (Number(conversationId) === id) {
        const nextId = list?.length ? Number(list[0].id) : null;
        if (nextId) {
          await selectConversation(nextId);
        } else {
          const convo = await clientAi.createConversation('AuditSec Assistant');
          await loadConversations();
          await selectConversation(convo.id);
        }
      }
    } catch (e) {
      setError(e);
    }
  };

  useEffect(() => {
    if (!menuOpenId) return;

    const onMouseDown = (e) => {
      if (menuRef.current && menuRef.current.contains(e.target)) return;
      if (menuAnchorRef.current && menuAnchorRef.current.contains(e.target)) return;
      setMenuOpenId(null);
    };

    const onKeyDown = (e) => {
      if (e.key === 'Escape') setMenuOpenId(null);
    };

    const onScroll = () => setMenuOpenId(null);

    document.addEventListener('mousedown', onMouseDown);
    document.addEventListener('keydown', onKeyDown);
    window.addEventListener('scroll', onScroll, true);
    return () => {
      document.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('scroll', onScroll, true);
    };
  }, [menuOpenId]);

  useEffect(() => {
    if (!menuOpenId) setMenuPos(null);
  }, [menuOpenId]);

  useEffect(() => {
    if (!menuOpenId || !menuPos) {
      setMenuShown(false);
      return;
    }

    setMenuShown(false);
    const raf = requestAnimationFrame(() => setMenuShown(true));
    return () => cancelAnimationFrame(raf);
  }, [menuOpenId, menuPos]);

  const menuConversation = useMemo(() => {
    if (!menuOpenId) return null;
    return conversations.find((c) => Number(c.id) === Number(menuOpenId)) || null;
  }, [menuOpenId, conversations]);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await loadConversations();
      const storedId = await ensureConversation();
      const exists = list.some((c) => Number(c.id) === Number(storedId));

      let idToOpen = storedId;
      if (!exists) {
        idToOpen = list?.length ? Number(list[0].id) : null;
        if (!idToOpen) {
          const convo = await clientAi.createConversation('AuditSec Assistant');
          await loadConversations();
          idToOpen = convo.id;
        }
      }

      await selectConversation(idToOpen);
      setTimeout(scrollToBottom, 50);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const canSend = useMemo(
    () => !sending && (input.trim().length > 0 || attachments.length > 0) && !!conversationId,
    [sending, input, conversationId, attachments]
  );

  const hasAnyUserMessages = useMemo(() => messages.some((m) => m.role === 'user' || m.role === 'assistant'), [messages]);

  const onSend = async () => {
    if (!canSend) return;
    const text = input.trim();
    const attachmentIds = attachments.map((a) => a.id);
    setInput('');
    setAttachments([]);

    setSending(true);
    setError(null);

    setMessages((prev) => [
      ...prev,
      {
        role: 'user',
        content: text || (attachmentIds.length ? '[attachments]' : ''),
        attachments: attachments,
      },
    ]);
    setTimeout(scrollToBottom, 50);

    try {
      const data = attachmentIds.length
        ? await clientAi.sendMessageWithAttachments(conversationId, text || 'Please analyze the attached files.', attachmentIds)
        : await clientAi.sendMessage(conversationId, text);
      setMessages((prev) => [...prev, { role: 'assistant', content: data.reply }]);
      if (Array.isArray(data.pendingApprovals)) setPending(data.pendingApprovals);
      else await loadApprovals();
      setTimeout(scrollToBottom, 50);
    } catch (e) {
      setError(e);
    } finally {
      setSending(false);
    }
  };

  const onPickFiles = async (files) => {
    if (!conversationId) return;
    const list = Array.from(files || []).slice(0, 10);
    if (!list.length) return;
    setUploading(true);
    setError(null);
    try {
      const uploaded = await clientAi.uploadAttachments(conversationId, list);
      setAttachments((prev) => [...prev, ...uploaded].slice(0, 10));
    } catch (e) {
      setError(e);
    } finally {
      setUploading(false);
      try {
        if (fileInputRef.current) fileInputRef.current.value = '';
      } catch {
        // ignore
      }
    }
  };

  const removeAttachment = (id) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const decideAndMaybeRun = async (approvalId, allow) => {
    setError(null);
    try {
      await clientAi.decideApproval(approvalId, allow);
      if (allow) {
        await clientAi.executeApproval(approvalId);
      }
      await loadApprovals();
    } catch (e) {
      setError(e);
    }
  };

  if (loading) {
    return (
      <div className="apple-card">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Assistant</div>
            <div className="text-2xl font-semibold text-gray-900 dark:text-gray-100">AuditSec AI</div>
          </div>
        </div>
        <div className="mt-6 space-y-3">
          <SkeletonBlock className="h-4 w-2/3" />
          <SkeletonBlock className="h-4 w-1/2" />
          <SkeletonBlock className="h-40 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 w-full">
      {error ? (
        <ErrorState
          kind={classifyApiError(error)}
          title="Assistant error"
          details={apiErrorMessage(error, 'Failed to load assistant')}
          onRetry={load}
        />
      ) : null}

      {/* Main chat */}
      <div className="lg:col-span-12">
        <div className="apple-card dark:bg-black relative overflow-hidden">
          {/* subtle dark background glow */}
          <div className="pointer-events-none absolute inset-0 hidden dark:block">
            <div className="absolute -top-24 left-1/2 -translate-x-1/2 h-64 w-[90%] rounded-full bg-white/5 blur-3xl" />
            <div className="absolute top-24 left-1/2 -translate-x-1/2 h-64 w-[70%] rounded-full bg-white/5 blur-3xl" />
          </div>

          <div className="relative">

              <button
                type="button"
                onClick={() => setHistoryOpen((v) => !v)}
                className="rounded-lg border border-gray-200 dark:border-white/10 px-3 py-2 text-xs text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                title={historyOpen ? 'Hide history' : 'Show history'}
              >
                {historyOpen ? 'Hide history' : 'Show history'}
              </button>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Chat</div>
              <div className="flex">
                <div
                  aria-hidden={!historyOpen}
                  className={
                    'shrink-0 overflow-hidden transition-all duration-200 ease-out ' +
                    (historyOpen ? 'w-[320px] mr-4 opacity-100 translate-x-0' : 'w-0 mr-0 opacity-0 -translate-x-2 pointer-events-none')
                  }
                >
                  <div className="w-[320px] rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black/40 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Assistant</div>
                        <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">Conversations</div>
                      </div>
                      <button
                        type="button"
                        onClick={createNewConversation}
                        className="rounded-lg border border-gray-200 dark:border-white/10 px-3 py-2 text-xs text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                      >
                        New
                      </button>
                    </div>

                    <div className="mt-4 space-y-2 max-h-[52vh] overflow-y-auto">
                      {conversations.map((c) => {
                        const active = Number(c.id) === Number(conversationId);
                        const isPinned = Number(c?.pinned || 0) === 1;
                        return (
                          <div
                            key={c.id}
                            className={
                              'w-full rounded-xl border px-3 py-3 transition-colors ' +
                              (active
                                ? 'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                                : 'bg-white dark:bg-black border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-gray-900')
                            }
                          >
                            <div className="flex items-start justify-between gap-2">
                              <button
                                type="button"
                                onClick={() => selectConversation(c.id)}
                                className="min-w-0 flex-1 text-left"
                                title={c.title || 'Conversation'}
                              >
                                {Number(renamingId) === Number(c.id) ? (
                                  <div className="space-y-2">
                                    <input
                                      value={renameValue}
                                      onChange={(e) => setRenameValue(e.target.value)}
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                          e.preventDefault();
                                          saveRename();
                                        }
                                        if (e.key === 'Escape') {
                                          e.preventDefault();
                                          cancelRename();
                                        }
                                      }}
                                      className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-black px-2.5 py-2 text-sm text-gray-900 dark:text-gray-100"
                                      placeholder="Conversation name"
                                      maxLength={80}
                                      autoFocus
                                    />
                                    <div className="flex items-center gap-2">
                                      <button
                                        type="button"
                                        disabled={renameSaving || !renameValue.trim()}
                                        onClick={(e) => {
                                          e.preventDefault();
                                          e.stopPropagation();
                                          saveRename();
                                        }}
                                        className={
                                          'rounded-lg px-3 py-1.5 text-xs border transition-colors ' +
                                          (renameSaving || !renameValue.trim()
                                            ? 'border-gray-200 dark:border-gray-700 text-gray-400'
                                            : 'border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-300 hover:bg-blue-500/15')
                                        }
                                      >
                                        {renameSaving ? 'Saving…' : 'Save'}
                                      </button>
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.preventDefault();
                                          e.stopPropagation();
                                          cancelRename();
                                        }}
                                        className="rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-1.5 text-xs text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <>
                                    <div className="flex items-center gap-2 min-w-0">
                                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate min-w-0">{c.title || 'Conversation'}</div>
                                      {isPinned ? (
                                        <span className="shrink-0 rounded-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-2 py-0.5 text-[10px] text-gray-700 dark:text-gray-200">
                                          Pinned
                                        </span>
                                      ) : null}
                                    </div>
                                    <div className="mt-1 text-xs text-gray-500 dark:text-gray-400 truncate">#{c.id}</div>
                                  </>
                                )}
                              </button>

                              {Number(renamingId) !== Number(c.id) ? (
                                <div className="shrink-0">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      const next = Number(menuOpenId) === Number(c.id) ? null : Number(c.id);
                                      if (!next) {
                                        setMenuOpenId(null);
                                        setMenuPos(null);
                                        return;
                                      }

                                      menuAnchorRef.current = e.currentTarget;
                                      const rect = e.currentTarget.getBoundingClientRect();
                                      const menuWidth = 192; // ~w-48
                                      const estimatedHeight = 140;
                                      const padding = 8;

                                      let left = rect.right - menuWidth;
                                      left = Math.max(padding, Math.min(left, window.innerWidth - menuWidth - padding));

                                      let top = rect.bottom + 8;
                                      if (top + estimatedHeight > window.innerHeight - padding) {
                                        top = Math.max(padding, rect.top - estimatedHeight - 8);
                                      }

                                      setMenuPos({ top, left });
                                      setMenuOpenId(next);
                                    }}
                                    className="rounded-lg border border-gray-200 dark:border-gray-700 px-2 py-1 text-xs text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                    title="Actions"
                                    aria-label="Conversation actions"
                                  >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                      <circle cx="12" cy="5" r="1.6" fill="currentColor" />
                                      <circle cx="12" cy="12" r="1.6" fill="currentColor" />
                                      <circle cx="12" cy="19" r="1.6" fill="currentColor" />
                                    </svg>
                                  </button>
                                </div>
                              ) : null}
                            </div>
                          </div>
                        );
                      })}

                      {!conversations.length ? (
                        <div className="text-sm text-gray-500 dark:text-gray-400">No conversations yet.</div>
                      ) : null}
                    </div>

                    {pending?.length ? (
                      <div className="mt-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Agent</div>
                            <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">Pending approvals</div>
                          </div>
                          <button
                            type="button"
                            onClick={loadApprovals}
                            className="rounded-lg border border-gray-200 dark:border-white/10 px-3 py-2 text-xs text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                          >
                            Refresh
                          </button>
                        </div>

                        <div className="mt-3 space-y-2 max-h-[22vh] overflow-y-auto">
                          {pending.map((a) => (
                            <div key={a.id} className="rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black p-3">
                              <div className="flex flex-col gap-2">
                                <div className="min-w-0">
                                  <div className="font-medium text-gray-900 dark:text-gray-100 truncate">{prettyActionLabel(a)}</div>
                                  <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">Expires: {a.expires_at || 'soon'}</div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => decideAndMaybeRun(a.id, false)}
                                    className="rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2 text-xs text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                  >
                                    Deny
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => decideAndMaybeRun(a.id, true)}
                                    className="rounded-lg border border-green-500/30 bg-green-500/10 px-3 py-2 text-xs text-green-700 dark:text-green-300 hover:bg-green-500/15 transition-colors"
                                  >
                                    Approve
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>

                <div className="min-w-0 flex-1">
                  <div className={historyOpen ? 'max-w-5xl mx-auto' : 'w-full'}>
                    {!hasAnyUserMessages ? (
                      <div className="min-h-[52vh] flex flex-col items-center justify-center text-center px-4">
                        <img
                          src="/brand/auditsec-logo.svg"
                          alt="AuditSec"
                          className="h-16 w-auto opacity-95 dark:hidden"
                        />
                        <img
                          src="/brand/auditsec-hero-a1%20blanc.svg"
                          alt="AuditSec"
                          className="h-16 w-auto opacity-95 hidden dark:block"
                        />
                        <div className="mt-6 text-2xl sm:text-3xl font-semibold tracking-tight text-gray-900 dark:text-gray-100">
                          How can I help you?
                        </div>
                        <div className="mt-3 text-sm sm:text-base text-gray-500 dark:text-gray-300 max-w-2xl">
                          Chat, send images, or share documents (PDF, logs, exports) to speed up the analysis.
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-[62vh] overflow-y-auto">
                        {messages.map((m, idx) => (
                          <div key={idx} className={m.role === 'user' ? 'flex justify-end' : 'flex justify-start'}>
                            <div className="max-w-[85%]">
                              <div
                                className={
                                  'rounded-xl px-3 py-2 text-sm whitespace-pre-wrap border ' +
                                  (m.role === 'user'
                                    ? 'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100'
                                    : 'bg-white dark:bg-black border-gray-200 dark:border-white/10 text-gray-900 dark:text-gray-100')
                                }
                              >
                                {m.content}
                              </div>

                              {Array.isArray(m.attachments) && m.attachments.length ? (
                                <div className="mt-2 flex flex-wrap gap-2">
                                  {m.attachments.map((a) => (
                                    <span
                                      key={a.id}
                                      className="inline-flex items-center rounded-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-2 py-1 text-xs text-gray-700 dark:text-gray-200"
                                    >
                                      {a.original_name}
                                    </span>
                                  ))}
                                </div>
                              ) : null}
                            </div>
                          </div>
                        ))}
                        <div ref={bottomRef} />
                      </div>
                    )}

                    {/* Composer */}
                    <div className="mt-3">
                      {attachments.length ? (
                        <div className="mb-3 flex flex-wrap gap-2">
                          {attachments.map((a) => (
                            <button
                              key={a.id}
                              type="button"
                              onClick={() => removeAttachment(a.id)}
                              className="inline-flex items-center gap-2 rounded-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-3 py-1.5 text-xs text-gray-800 dark:text-gray-200 hover:opacity-80"
                              title="Remove"
                            >
                              <span className="truncate max-w-[220px]">{a.original_name}</span>
                              <span className="text-gray-500">×</span>
                            </button>
                          ))}
                        </div>
                      ) : null}

                      <div className={historyOpen ? 'max-w-4xl mx-auto' : 'w-full'}>
                        <div className="flex items-center gap-2 rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 px-3 py-2">
                          <input
                            ref={fileInputRef}
                            type="file"
                            multiple
                            className="hidden"
                            onChange={(e) => onPickFiles(e.target.files)}
                            accept="image/*,.pdf,.txt,.log,.md,.json,.csv"
                          />
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploading}
                            className={
                              'rounded-xl border px-3 py-2 text-sm transition-colors ' +
                              (uploading
                                ? 'border-gray-200 dark:border-gray-700 text-gray-400'
                                : 'border-gray-200 dark:border-white/10 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/10')
                            }
                            title="Attach files"
                          >
                            {uploading ? 'Uploading…' : 'Attach'}
                          </button>

                          <input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                onSend();
                              }
                            }}
                            placeholder="Message AuditSec"
                            className="flex-1 bg-transparent px-2 py-2 text-sm text-gray-900 dark:text-gray-100 outline-none"
                          />

                          <button
                            type="button"
                            disabled={!canSend}
                            onClick={onSend}
                            className={
                              'rounded-xl px-4 py-2 text-sm border transition-colors ' +
                              (canSend
                                ? 'border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/10 text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-white/15'
                                : 'border-gray-200 dark:border-white/10 text-gray-400')
                            }
                          >
                            {sending ? 'Sending…' : 'Send'}
                          </button>
                        </div>
                      </div>

                      <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                        Active scans require explicit approval and verified targets.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            </div>
          </div>
        </div>

        {menuOpenId && menuPos && menuConversation
          ? createPortal(
              <div
                ref={menuRef}
                className={
                  'fixed w-48 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black overflow-hidden z-[9999] shadow-lg ' +
                  'origin-top-right transition duration-150 ease-out ' +
                  (menuShown ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 -translate-y-1')
                }
                style={{ top: `${menuPos.top}px`, left: `${menuPos.left}px` }}
              >
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setMenuOpenId(null);
                    togglePinned(menuConversation);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-900"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M14 4V7.2C14 7.518 14.126 7.823 14.351 8.049L16 9.697V12.5C16 13.881 14.881 15 13.5 15H12V21L10 19L8 21V15H6.5C5.119 15 4 13.881 4 12.5V9.697L5.649 8.049C5.874 7.823 6 7.518 6 7.2V4H14Z"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span>{Number(menuConversation?.pinned || 0) === 1 ? 'Désépingler' : 'Épingler'}</span>
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setMenuOpenId(null);
                    startRename(menuConversation);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-900"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M4 20H8L18.5 9.5C19.328 8.672 19.328 7.328 18.5 6.5L17.5 5.5C16.672 4.672 15.328 4.672 14.5 5.5L4 16V20Z"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M13.5 6.5L17.5 10.5"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                    />
                  </svg>
                  <span>Renommer</span>
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setMenuOpenId(null);
                    deleteConversation(menuConversation);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-700 dark:text-red-300 hover:bg-red-500/10"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M9 3H15M4 6H20M7 6L8 20H16L17 6M10 10V17M14 10V17"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span>Supprimer</span>
                </button>
              </div>,
              document.body
            )
          : null}
      </div>
    </div>
  );
}
