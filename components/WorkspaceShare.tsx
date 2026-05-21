"use client"

import { useState } from "react"
import { Share2, Copy, Trash2, Users, Lock, Eye, Plus, X, Loader2, Link2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createShareLink, getWorkspaceShares, revokeShare, updateShareRole, inviteUser } from "@/actions/share"
import { WorkspaceRole } from "@prisma/client"

interface ShareOption {
  value: WorkspaceRole
  label: string
  description: string
  icon: React.ReactNode
}

const SHARE_OPTIONS: ShareOption[] = [
  {
    value: "COLLABORATOR",
    label: "Collaborator",
    description: "Can edit and make changes",
    icon: <Users className="w-4 h-4" />
  },
  {
    value: "READER",
    label: "Reader",
    description: "View-only access",
    icon: <Eye className="w-4 h-4" />
  }
]

interface WorkspaceShareProps {
  workspaceId: string
  workspaceName?: string
}

export function WorkspaceShare({ workspaceId, workspaceName = "Workspace" }: WorkspaceShareProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedRole, setSelectedRole] = useState<WorkspaceRole>("READER")
  const [inviteeEmail, setInviteeEmail] = useState("")
  const [shares, setShares] = useState<any[]>([])
  const [shareUrl, setShareUrl] = useState("")
  const [isLoadingShares, setIsLoadingShares] = useState(false)
  const [isCreatingLink, setIsCreatingLink] = useState(false)
  const [isDeletingShare, setIsDeletingShare] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const handleOpenDialog = async () => {
    setIsLoadingShares(true)
    setShareUrl("")
    const result = await getWorkspaceShares(workspaceId)
    if (result.success) {
      setShares(result.shares || [])
    }
    setIsLoadingShares(false)
  }

  const handleCreateShareLink = async () => {
    setIsCreatingLink(true)
    const result = await createShareLink(workspaceId, selectedRole as WorkspaceRole)
    
    if (result.success) {
      setShareUrl(result.shareUrl || "")
      // Refresh shares list
      const sharesResult = await getWorkspaceShares(workspaceId)
      if (sharesResult.success) {
        setShares(sharesResult.shares || [])
      }
    }
    setIsCreatingLink(false)
  }

  const handleInviteUser = async () => {
    if (!inviteeEmail.trim()) return

    const result = await inviteUser(workspaceId, inviteeEmail, selectedRole as WorkspaceRole)
    
    if (result.success) {
      setInviteeEmail("")
      const sharesResult = await getWorkspaceShares(workspaceId)
      if (sharesResult.success) {
        setShares(sharesResult.shares || [])
      }
    }
  }

  const handleRevokeShare = async (shareId: string) => {
    setIsDeletingShare(shareId)
    const result = await revokeShare(shareId)
    
    if (result.success) {
      setShares(shares.filter(s => s.id !== shareId))
    }
    setIsDeletingShare(null)
  }

  const handleCopyLink = () => {
    if (shareUrl) {
      navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const getRoleIcon = (role: WorkspaceRole) => {
    switch (role) {
      case "COLLABORATOR":
        return <Users className="w-4 h-4" />
      case "READER":
        return <Eye className="w-4 h-4" />
      default:
        return <Lock className="w-4 h-4" />
    }
  }

  const getRoleLabel = (role: WorkspaceRole) => {
    return role === "COLLABORATOR" ? "Collaborator" : "Reader"
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-2"
          onClick={handleOpenDialog}
        >
          <Share2 className="w-4 h-4" />
          Share
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Share "{workspaceName}"</DialogTitle>
          <DialogDescription>
            Manage access and invite people to collaborate on this workspace
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Create Share Link Section */}
          <div className="border rounded-lg p-4 bg-blue-50 dark:bg-blue-950">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Link2 className="w-4 h-4" />
              Create Share Link
            </h3>

            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Access Level
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {SHARE_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setSelectedRole(option.value)}
                      className={`p-3 text-left rounded-lg border-2 transition-all ${
                        selectedRole === option.value
                          ? "border-blue-600 bg-blue-100 dark:bg-blue-900"
                          : "border-border bg-background hover:border-blue-400"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        {option.icon}
                        <span className="font-medium text-sm">{option.label}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {option.description}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {shareUrl ? (
                <div className="flex gap-2">
                  <Input
                    value={shareUrl}
                    readOnly
                    className="font-mono text-xs"
                  />
                  <Button
                    onClick={handleCopyLink}
                    variant="outline"
                    size="sm"
                    className="min-w-fit"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    {copied ? "Copied!" : "Copy"}
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={handleCreateShareLink}
                  disabled={isCreatingLink}
                  className="w-full"
                >
                  {isCreatingLink ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Shareable Link
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>

          {/* Invite User Section */}
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Users className="w-4 h-4" />
              Invite Specific People
            </h3>

            <div className="space-y-3">
              <div className="flex gap-2">
                <Input
                  placeholder="Enter user ID or email"
                  value={inviteeEmail}
                  onChange={(e) => setInviteeEmail(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleInviteUser()
                    }
                  }}
                />
                <Button
                  onClick={handleInviteUser}
                  size="sm"
                  className="min-w-fit"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Invite
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Role will be set to: <span className="font-semibold">{getRoleLabel(selectedRole)}</span>
              </p>
            </div>
          </div>

          {/* Active Shares Section */}
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Lock className="w-4 h-4" />
              Active Access
            </h3>

            {isLoadingShares ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-4 h-4 animate-spin" />
              </div>
            ) : shares.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No active shares yet
              </p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {shares.map((share) => (
                  <div
                    key={share.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      {getRoleIcon(share.role)}
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">
                          {share.userId || share.shareToken?.slice(0, 8) + "..."}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {getRoleLabel(share.role)}
                        </p>
                      </div>
                    </div>

                    <Button
                      onClick={() => handleRevokeShare(share.id)}
                      disabled={isDeletingShare === share.id}
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                    >
                      {isDeletingShare === share.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Info Section */}
          <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
            <p className="text-xs text-amber-800 dark:text-amber-200">
              <strong>💡 Tip:</strong> Share links are public and don't require users to sign in. 
              Invite specific people for better control and audit trails.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Export component for adding to existing UI
export default WorkspaceShare
