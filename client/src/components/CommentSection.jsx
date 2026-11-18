import React, { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import { api } from '../services/api';
import { MessageSquare, Send, Shield, User, Loader2, AlertCircle } from 'lucide-react';

export function CommentSection({ ticketId }) {
  const { currentUser } = useUser();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    async function fetchComments() {
      try {
        setLoading(true);
        setError(null);
        const res = await api.getComments(ticketId, currentUser?.id);
        if (isMounted) {
          setComments(res.comments);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Failed to load comments');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    if (ticketId && currentUser) {
      fetchComments();
    }

    return () => { isMounted = false; };
  }, [ticketId, currentUser]);

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!message.trim() || submitting) return;

    if (message.trim().length > 500) {
      setError('Comment must not exceed 500 characters.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      const res = await api.addComment(ticketId, message.trim(), currentUser?.id);
      setComments(prev => [...prev, res.comment]);
      setMessage('');
    } catch (err) {
      setError(err.message || 'Failed to post comment');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-indigo-600" />
          <h3 className="text-sm font-bold text-slate-800">
            Discussion & Activity ({comments.length})
          </h3>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Comment List */}
      <div className="space-y-3">
        {loading ? (
          <div className="flex items-center justify-center py-6 text-slate-400 text-xs gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Loading conversation...</span>
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-6 bg-slate-50 border border-dashed border-slate-200 rounded-xl">
            <p className="text-xs text-slate-500">No comments yet. Start the conversation below.</p>
          </div>
        ) : (
          comments.map((comment) => {
            const isStaff = comment.author_role === 'SUPPORT';
            const isSelf = comment.user_id === currentUser?.id;

            return (
              <div
                key={comment.id}
                className={`p-3.5 rounded-xl border transition-all text-xs ${
                  isStaff
                    ? 'bg-purple-50/50 border-purple-200/70'
                    : 'bg-white border-slate-200 shadow-xs'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      isStaff ? 'bg-purple-600 text-white' : 'bg-slate-700 text-white'
                    }`}>
                      {comment.author_name ? comment.author_name.charAt(0) : 'U'}
                    </div>
                    <span className="font-semibold text-slate-900">
                      {comment.author_name} {isSelf && <span className="text-slate-400 font-normal">(You)</span>}
                    </span>
                    <span className={`inline-flex items-center gap-0.5 text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                      isStaff ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {isStaff ? (
                        <>
                          <Shield className="w-2.5 h-2.5" />
                          <span>Staff</span>
                        </>
                      ) : (
                        <>
                          <User className="w-2.5 h-2.5" />
                          <span>Employee</span>
                        </>
                      )}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400">
                    {new Date(comment.created_at).toLocaleString([], {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
                <p className="text-slate-700 whitespace-pre-wrap leading-relaxed pl-7">
                  {comment.message}
                </p>
              </div>
            );
          })
        )}
      </div>

      {/* New Comment Input */}
      <form onSubmit={handleAddComment} className="pt-2">
        <div className="relative">
          <textarea
            rows={2}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={`Reply as ${currentUser?.name || 'User'}...`}
            className="w-full text-xs p-3 pr-20 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-hidden bg-white shadow-xs transition resize-none"
          />
          <div className="absolute right-2 bottom-2.5 flex items-center gap-2">
            <span className={`text-[10px] ${message.length > 500 ? 'text-rose-600 font-bold' : 'text-slate-400'}`}>
              {message.length}/500
            </span>
            <button
              type="submit"
              disabled={submitting || !message.trim() || message.length > 500}
              className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs disabled:opacity-40 transition"
            >
              {submitting ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <Send className="w-3 h-3" />
              )}
              <span>Send</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
