"use client"

import * as React from "react"
import { type ToastProps } from "@/components/ui/toast"

const TOAST_LIMIT = 1
const TOAST_REMOVE_DELAY = 4000

type ToasterToast = ToastProps & {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
  duration?: number // ✅ tambahkan ini agar header.tsx tidak error
}

const actionTypes = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST",
} as const

let count = 0
function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER
  return count.toString()
}

type Action =
  | { type: "ADD_TOAST"; toast: ToasterToast }
  | { type: "UPDATE_TOAST"; toast: Partial<ToasterToast> }
  | { type: "DISMISS_TOAST"; toastId?: string }
  | { type: "REMOVE_TOAST"; toastId?: string }

interface State {
  toasts: ToasterToast[]
}

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>()

function addToRemoveQueue(toastId: string, delay = TOAST_REMOVE_DELAY) {
  if (toastTimeouts.has(toastId)) return
  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId)
    dispatch({ type: "REMOVE_TOAST", toastId })
  }, delay)
  toastTimeouts.set(toastId, timeout)
}


function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "ADD_TOAST":
      return { ...state, toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT) }

    case "UPDATE_TOAST":
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t
        ),
      }

    case "DISMISS_TOAST":
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toastId || !action.toastId ? { ...t, open: false } : t
        ),
      }

    case "REMOVE_TOAST":
      return { ...state, toasts: state.toasts.filter((t) => t.id !== action.toastId) }

    default:
      return state
  }
}

const listeners: Array<(state: State) => void> = []
let memoryState: State = { toasts: [] }

function dispatch(action: Action) {
  memoryState = reducer(memoryState, action)
  listeners.forEach((listener) => listener(memoryState))
}

export function useToast() {
  const [state, setState] = React.useState<State>(memoryState)

  React.useEffect(() => {
    listeners.push(setState)
    return () => {
      const index = listeners.indexOf(setState)
      if (index > -1) listeners.splice(index, 1)
    }
  }, [])

  return {
    ...state,
    toast: (props: Omit<ToasterToast, "id">) => {
      const id = genId()
      const dismiss = () => dispatch({ type: "DISMISS_TOAST", toastId: id })

      dispatch({
        type: "ADD_TOAST",
        toast: { ...props, id, open: true, onOpenChange: (open) => !open && dismiss() },
      })

      return { id, dismiss }
    },
    dismiss: (toastId?: string) => dispatch({ type: "DISMISS_TOAST", toastId }),
  }
}

