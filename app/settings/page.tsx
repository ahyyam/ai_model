"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
import { auth } from "@/lib/firebase"
import { onAuthStateChanged, updateProfile, User as FirebaseUser, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth"
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
    if (!user || !currentPassword || !newPassword) {
      setPasswordMessage("Please enter both current and new passwords.")
      return
    }
    setPasswordLoading(true)
    try {
      // Re-authenticate user with current password
      const credential = EmailAuthProvider.credential(user.email!, currentPassword)
      await reauthenticateWithCredential(user, credential)
      
      // Update password
      await updatePassword(user, newPassword)
      setPasswordMessage("Password updated successfully!")
      setCurrentPassword("")
      setNewPassword("")
    } catch (err: any) {
      if (err.code === 'auth/wrong-password') {
        setPasswordMessage("Current password is incorrect. Please try again.")
      } else {
        setPasswordMessage(err.message || "Failed to update password.")
      }
    } finally {
      setPasswordLoading(false)
    }
  }

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
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
          {message && (
            <div className={`p-3 rounded-lg border ${
              message.includes('updated') 
                ? 'bg-green-500/10 border-green-500/20 text-green-400' 
                : 'bg-red-500/10 border-red-500/20 text-red-400'
            }`}>
              {message}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-[#1c1c1c] border-gray-800 text-white">
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
          <CardDescription>Update your account password.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Current Password</Label>
            <div className="relative">
              <Input
                id="currentPassword"
                type={showCurrentPassword ? "text" : "password"}
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                className="bg-gray-800/50 border-gray-700 pr-12"
                disabled={!user}
                placeholder="Enter your current password"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              >
                {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="newPassword">New Password</Label>
            <div className="relative">
              <Input
                id="newPassword"
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                className="bg-gray-800/50 border-gray-700 pr-12"
                disabled={!user}
                placeholder="Enter your new password"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                onClick={() => setShowNewPassword(!showNewPassword)}
              >
                {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <Button 
            className="bg-blue-600 hover:bg-blue-700" 
            onClick={handleChangePassword} 
            disabled={passwordLoading || !user || !currentPassword || !newPassword}
          >
            {passwordLoading ? "Updating..." : "Update Password"}
          </Button>
          {passwordMessage && (
            <div className={`p-3 rounded-lg border ${
              passwordMessage.includes('successfully') 
                ? 'bg-green-500/10 border-green-500/20 text-green-400' 
                : 'bg-red-500/10 border-red-500/20 text-red-400'
            }`}>
              {passwordMessage}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
