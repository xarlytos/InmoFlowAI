import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';
import { 
  MessageCircle, 
  Send,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Reply,
  Edit,
  Trash2,
  AlertCircle,
  Users,
  Share2
} from 'lucide-react';
import type { ContentComment, ContentHistory, ApprovalStatus } from '../types/marketing';

interface CollaborationPanelProps {
  content: ContentHistory;
  currentUserId: string;
  currentUserName: string;
  onAddComment: (comment: string) => void;
  onReplyToComment: (commentId: string, reply: string) => void;
  onDeleteComment: (commentId: string) => void;
  onResolveComment: (commentId: string) => void;
  onApproveContent: () => void;
  onRejectContent: (reason: string) => void;
  onRequestApproval: () => void;
  onShareContent: (userIds: string[]) => void;
}

export function CollaborationPanel({
  content,
  currentUserId,
  currentUserName,
  onAddComment,
  onReplyToComment,
  onDeleteComment,
  onResolveComment,
  onApproveContent,
  onRejectContent,
  onRequestApproval,
  onShareContent
}: CollaborationPanelProps) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectionForm, setShowRejectionForm] = useState(false);
  const [shareUserIds, setShareUserIds] = useState<string[]>([]);

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    
    onAddComment(newComment);
    setNewComment('');
    showToast({
      type: 'success',
      title: 'Comment added successfully'
    });
  };

  const handleReplyToComment = (commentId: string) => {
    if (!replyText.trim()) return;
    
    onReplyToComment(commentId, replyText);
    setReplyText('');
    setReplyingTo(null);
    showToast({
      type: 'success',
      title: 'Reply added successfully'
    });
  };

  const handleRejectContent = () => {
    if (!rejectionReason.trim()) {
      showToast({
        type: 'error',
        title: 'Please provide a reason for rejection'
      });
      return;
    }
    
    onRejectContent(rejectionReason);
    setRejectionReason('');
    setShowRejectionForm(false);
    showToast({
      type: 'success',
      title: 'Content rejected'
    });
  };

  const getStatusIcon = (status: ApprovalStatus) => {
    switch (status) {
      case 'approved': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'pending': return <Clock className="h-4 w-4 text-yellow-500" />;
      default: return <Edit className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusText = (status: ApprovalStatus) => {
    switch (status) {
      case 'approved': return 'Approved';
      case 'rejected': return 'Rejected';
      case 'pending': return 'Pending Approval';
      default: return 'Draft';
    }
  };

  const unresolvedComments = content.comments.filter(c => !c.isResolved);
  const resolvedComments = content.comments.filter(c => c.isResolved);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Collaboration & Approval
        </h3>
        
        <div className="flex items-center gap-2">
          {getStatusIcon(content.approvalStatus)}
          <span className="text-sm font-medium">
            {getStatusText(content.approvalStatus)}
          </span>
        </div>
      </div>

      {/* Approval Actions */}
      <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <h4 className="font-medium text-gray-900 dark:text-white mb-3">
          Approval Status
        </h4>
        
        {content.approvalStatus === 'draft' && (
          <div className="flex gap-2">
            <Button
              onClick={onRequestApproval}
              size="sm"
            >
              <Send className="h-4 w-4 mr-1" />
              Request Approval
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onShareContent(shareUserIds)}
            >
              <Share2 className="h-4 w-4 mr-1" />
              Share for Review
            </Button>
          </div>
        )}

        {content.approvalStatus === 'pending' && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-yellow-600 dark:text-yellow-400">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">Waiting for approval</span>
            </div>
            
            <div className="flex gap-2">
              <Button
                onClick={onApproveContent}
                size="sm"
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                Approve
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowRejectionForm(true)}
                className="border-red-300 text-red-600 hover:bg-red-50"
              >
                <XCircle className="h-4 w-4 mr-1" />
                Reject
              </Button>
            </div>

            {showRejectionForm && (
              <div className="mt-3 p-3 border border-red-200 rounded-lg">
                <Input
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Reason for rejection..."
                  className="mb-2"
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={handleRejectContent}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Confirm Rejection
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowRejectionForm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {content.approvalStatus === 'approved' && content.approvedBy && (
          <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
            <CheckCircle className="h-4 w-4" />
            <span className="text-sm">
              Approved by {content.approvedBy} on {content.approvedAt && new Date(content.approvedAt).toLocaleDateString()}
            </span>
          </div>
        )}

        {content.approvalStatus === 'rejected' && (
          <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
            <XCircle className="h-4 w-4" />
            <span className="text-sm">Content has been rejected</span>
          </div>
        )}
      </div>

      {/* Add New Comment */}
      <div className="mb-6">
        <h4 className="font-medium text-gray-900 dark:text-white mb-3">
          Add Comment
        </h4>
        <div className="flex gap-2">
          <div className="flex-1">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add your comment..."
              rows={3}
              className="block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-gray-900 dark:text-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
            />
          </div>
          <Button
            onClick={handleAddComment}
            disabled={!newComment.trim()}
            size="sm"
            className="self-start mt-2"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Comments List */}
      <div className="space-y-6">
        {/* Unresolved Comments */}
        {unresolvedComments.length > 0 && (
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              Active Comments ({unresolvedComments.length})
            </h4>
            
            <div className="space-y-4">
              {unresolvedComments.map((comment) => (
                <div key={comment.id} className="border border-red-200 dark:border-red-700 rounded-lg p-4 bg-red-50 dark:bg-red-900/20">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {comment.userName}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(comment.createdAt).toLocaleString()}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onResolveComment(comment.id)}
                        title="Mark as Resolved"
                      >
                        <CheckCircle className="h-3 w-3 text-green-500" />
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setReplyingTo(comment.id)}
                        title="Reply"
                      >
                        <Reply className="h-3 w-3" />
                      </Button>
                      
                      {comment.userId === currentUserId && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDeleteComment(comment.id)}
                          title="Delete Comment"
                        >
                          <Trash2 className="h-3 w-3 text-red-500" />
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                    {comment.comment}
                  </p>

                  {/* Reply Form */}
                  {replyingTo === comment.id && (
                    <div className="mt-3 pt-3 border-t border-red-300">
                      <div className="flex gap-2">
                        <div className="flex-1">
                          <Input
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            placeholder="Write a reply..."
                            size="sm"
                          />
                        </div>
                        <Button
                          onClick={() => handleReplyToComment(comment.id)}
                          disabled={!replyText.trim()}
                          size="sm"
                        >
                          <Send className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setReplyingTo(null)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Resolved Comments */}
        {resolvedComments.length > 0 && (
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Resolved Comments ({resolvedComments.length})
            </h4>
            
            <div className="space-y-3">
              {resolvedComments.map((comment) => (
                <div key={comment.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-3 bg-gray-50 dark:bg-gray-700 opacity-75">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <User className="h-3 w-3 text-gray-400" />
                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                        {comment.userName}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </span>
                      <CheckCircle className="h-3 w-3 text-green-500" />
                    </div>
                  </div>
                  
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {comment.comment}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {content.comments.length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No comments yet. Be the first to add feedback!</p>
          </div>
        )}
      </div>
    </div>
  );
}