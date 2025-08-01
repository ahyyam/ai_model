"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
import { auth } from "@/lib/firebase"
import { onAuthStateChanged, updateProfile, User as FirebaseUser, updatePassword, deleteUser } from "firebase/auth"
import { Eye, EyeOff } from "lucide-react"

export default function SettingsPage() {
  const [user, setUser] = useState<FirebaseUser | null>(null)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState("")
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [passwordMessage, setPasswordMessage] = useState("")
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [deleteMessage, setDeleteMessage] = useState("")
  const [accountDeleted, setAccountDeleted] = useState(false)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser)
      setName(firebaseUser?.displayName || "")
      setEmail(firebaseUser?.email || "")
    })
    return () => unsubscribe()
  }, [])

  const handleSave = async () => {
    if (!user) return
    setSaving(true)
    setMessage("")
    try {
      await updateProfile(user, { displayName: name })
      setMessage("Profile updated!")
    } catch (err: any) {
      setMessage(err.message || "Failed to update profile.")
    } finally {
      setSaving(false)
    }
  }

  const handleChangePassword = async () => {
    setPasswordMessage("")
    if (!user || !newPassword) return
    setPasswordLoading(true)
    try {
      await updatePassword(user, newPassword)
      setPasswordMessage("Password updated!")
      setCurrentPassword("")
      setNewPassword("")
    } catch (err: any) {
      setPasswordMessage(err.message || "Failed to update password.")
    } finally {
      setPasswordLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    setDeleteMessage("")
    if (!user) return
    setDeleteLoading(true)
    try {
      await deleteUser(user)
      setAccountDeleted(true)
      setDeleteMessage("Account deleted. You will be logged out.")
      setTimeout(() => {
        window.location.href = "/"
      }, 2000)
    } catch (err: any) {
      setDeleteMessage(err.message || "Failed to delete account.")
    } finally {
      setDeleteLoading(false)
    }
  }

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      {accountDeleted ? (
        <div className="text-green-500 text-center text-lg py-12">Account deleted. You will be logged out.</div>
      ) : (
        <>
          <div>
            <h1 className="text-3xl font-bold text-white font-sora">Account Settings</h1>
            <p className="text-gray-400 mt-1">Manage your account details and preferences.</p>
          </div>

          <Card className="bg-[#1c1c1c] border-gray-800 text-white">
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>This is how others will see you on the site.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="bg-gray-800/50 border-gray-700"
                  disabled={!user}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  disabled
                  className="bg-gray-800/50 border-gray-700"
                />
              </div>
              <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleSave} disabled={saving || !user}>
                {saving ? "Saving..." : "Save Changes"}
              </Button>
              {message && <div className={`text-sm ${message.includes('updated') ? 'text-green-500' : 'text-red-500'}`}>{message}</div>}
            </CardContent>
          </Card>

          <Card className="bg-[#1c1c1c] border-gray-800 text-white">
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>Update your password here. Choose a strong one!</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">Current Password</Label>
                <div className="relative">
                  <Input
                    id="current-password"
                    type={showCurrentPassword ? "text" : "password"}
                    className="bg-gray-800/50 border-gray-700 pr-12"
                    value={currentPassword}
                    onChange={e => setCurrentPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white text-lg p-1"
                    onClick={() => setShowCurrentPassword((v) => !v)}
                    tabIndex={-1}
                    aria-label={showCurrentPassword ? "Hide password" : "Show password"}
                  >
                    {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <div className="relative">
                  <Input
                    id="new-password"
                    type={showNewPassword ? "text" : "password"}
                    className="bg-gray-800/50 border-gray-700 pr-12"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white text-lg p-1"
                    onClick={() => setShowNewPassword((v) => !v)}
                    tabIndex={-1}
                    aria-label={showNewPassword ? "Hide password" : "Show password"}
                  >
                    {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleChangePassword} disabled={passwordLoading || !user}>
                {passwordLoading ? "Updating..." : "Update Password"}
              </Button>
              {passwordMessage && <div className={`text-sm ${passwordMessage.includes('updated') ? 'text-green-500' : 'text-red-500'}`}>{passwordMessage}</div>}
            </CardContent>
          </Card>

          <Card className="bg-[#1c1c1c] border-red-500/30 text-white">
            <CardHeader>
              <CardTitle className="text-red-400">Danger Zone</CardTitle>
              <CardDescription>Be careful, these actions are irreversible.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="destructive" onClick={handleDeleteAccount} disabled={deleteLoading || !user}>
                {deleteLoading ? "Deleting..." : "Delete Account"}
              </Button>
              {deleteMessage && <div className={`text-sm mt-2 ${deleteMessage.includes('deleted') ? 'text-green-500' : 'text-red-500'}`}>{deleteMessage}</div>}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
