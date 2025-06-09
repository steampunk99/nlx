
import { useState, useEffect } from "react"
import { CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { usePrizeConfig } from "@/hooks/usePrizeAdmin"
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react"

export default function PrizeForm({ initialData, onSuccess, mode }) {
  const { createOrUpdateConfig, isLoading, error } = usePrizeConfig()
  const [form, setForm] = useState({
    title: "",
    amount: "",
    startTimeUTC: "",
    durationMinutes: "",
    maxWinners: "",
    isActive: false,
  })
  const [success, setSuccess] = useState("")

  useEffect(() => {
    if (initialData) {
      setForm({
        title: initialData.title || "",
        amount: initialData.amount || "",
        startTimeUTC: initialData.startTimeUTC || "",
        durationMinutes: initialData.durationMinutes || "",
        maxWinners: initialData.maxWinners || "",
        isActive: !!initialData.isActive,
      })
    }
  }, [initialData])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSuccess("")
    try {
      await createOrUpdateConfig(
        {
          ...form,
          amount: Number(form.amount),
          durationMinutes: Number(form.durationMinutes),
          maxWinners: Number(form.maxWinners),
        },
        initialData?.id,
      )
      setSuccess("Prize configuration saved successfully!")
      if (onSuccess) onSuccess()
    } catch (err) {}
  }

  return (
    <CardContent className="p-0">
      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <Label htmlFor="title" className="text-sm font-medium text-gray-700">
            Prize Title
          </Label>
          <Input
            id="title"
            name="title"
            value={form.title}
            onChange={handleChange}
            required
            className="border-gray-200 focus:border-black focus:ring-black"
            placeholder="Enter prize title"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="amount" className="text-sm font-medium text-gray-700">
              Prize Amount ($)
            </Label>
            <Input
              id="amount"
              name="amount"
              type="number"
              value={form.amount}
              onChange={handleChange}
              required
              min={1}
              className="border-gray-200 focus:border-black focus:ring-black"
              placeholder="0"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="maxWinners" className="text-sm font-medium text-gray-700">
              Max Winners
            </Label>
            <Input
              id="maxWinners"
              name="maxWinners"
              type="number"
              value={form.maxWinners}
              onChange={handleChange}
              required
              min={1}
              className="border-gray-200 focus:border-black focus:ring-black"
              placeholder="1"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="startTimeUTC" className="text-sm font-medium text-gray-700">
              Start Time (EAT)
            </Label>
            <Input
              id="startTimeUTC"
              name="startTimeUTC"
              value={form.startTimeUTC}
              onChange={handleChange}
              required
              placeholder="13:00"
              className="border-gray-200 focus:border-black focus:ring-black"
            />
            <p className="text-xs text-gray-500">Format: HH:mm (24-hour)</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="durationMinutes" className="text-sm font-medium text-gray-700">
              Duration (minutes)
            </Label>
            <Input
              id="durationMinutes"
              name="durationMinutes"
              type="number"
              value={form.durationMinutes}
              onChange={handleChange}
              required
              min={1}
              className="border-gray-200 focus:border-black focus:ring-black"
              placeholder="60"
            />
          </div>
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="space-y-1">
            <Label htmlFor="isActive" className="text-sm font-medium text-gray-700">
              Prize Status
            </Label>
            <p className="text-xs text-gray-500">
              {form.isActive ? "Prize is currently active and available" : "Prize is inactive and not available"}
            </p>
          </div>
          <Switch
            id="isActive"
            name="isActive"
            checked={form.isActive}
            onCheckedChange={(val) => setForm((f) => ({ ...f, isActive: val }))}
            className="data-[state=checked]:bg-black"
          />
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full bg-black hover:bg-gray-800 text-white font-medium py-2.5"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              {mode === "edit" ? "Updating..." : "Creating..."}
            </>
          ) : (
            <>{mode === "edit" ? "Update Prize" : "Create Prize"}</>
          )}
        </Button>
      </form>

      <div className="mt-6 space-y-3">
        {success && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-800">Success</AlertTitle>
            <AlertDescription className="text-green-700">{success}</AlertDescription>
          </Alert>
        )}
        {error && (
          <Alert variant="destructive" className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error?.message || error?.toString?.() || error}</AlertDescription>
          </Alert>
        )}
      </div>
    </CardContent>
  )
}
