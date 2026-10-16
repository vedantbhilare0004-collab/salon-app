"use client"

import { Card } from "@/components/ui/card"
import { useData } from "@/lib/store"
import { Branch } from "@/lib/types"

export default function OwnerBranches() {
  const { branches } = useData()

  return (
    <div className="space-y-8 p-6">
      <h1 className="text-3xl font-bold">Branches</h1>
      <Card className="p-4">
        {branches.length === 0 ? (
          <p className="text-muted-foreground">No branches found.</p>
        ) : (
          <ul className="space-y-2">
            {branches.map((b: Branch) => (
              <li key={b.id} className="flex justify-between items-center border-b pb-2">
                <div>
                  <h2 className="font-medium">{b.name}</h2>
                  <p className="text-sm text-muted-foreground">{b.address}</p>
                </div>
                <button className="text-primary hover:underline" onClick={() => {/* TODO: edit */}}>
                  Edit
                </button>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  )
}
