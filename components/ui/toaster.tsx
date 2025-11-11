"use client"

import { useToast } from "@/components/ui/use-toast"
import { Toast } from "@/components/ui/toast"
import { AnimatePresence, motion } from "framer-motion"

export function Toaster() {
  const { toasts, dismiss } = useToast()

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      <AnimatePresence>
        {toasts.map(({ id, open = true, ...props }) =>
          open ? (
            <motion.div
              key={id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.25 }}
            >
              <Toast {...props} onClose={() => dismiss(id)} />
            </motion.div>
          ) : null
        )}
      </AnimatePresence>
    </div>
  )
}
