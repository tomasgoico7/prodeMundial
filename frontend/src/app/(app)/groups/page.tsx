'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus, LogIn, Users, Loader2, Crown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  useMyGroups,
  useCreateGroup,
  useJoinGroup,
} from '@/features/groups/use-groups';
import { useAuthStore } from '@/store/auth-store';

export default function GroupsPage() {
  const { data: groups, isLoading } = useMyGroups();
  const user = useAuthStore((s) => s.user);

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
        <div>
          <h1 className="font-display text-4xl uppercase tracking-tight">
            Mis barras
          </h1>
          <p className="text-muted-foreground">
            La oficina, los pibes del barrio o la familia. Cada barra, su tabla.
          </p>
        </div>
        <div className="flex gap-2">
          <JoinGroupDialog />
          <CreateGroupDialog />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading &&
          Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-40 w-full" />
          ))}
        {groups?.map((g) => (
          <Link key={g.id} href={`/groups/${g.id}`}>
            <Card className="h-full transition-transform hover:-translate-y-1">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle>{g.name}</CardTitle>
                  {g.owner.id === user?.id && (
                    <Badge variant="accent" className="gap-1">
                      <Crown className="h-3 w-3" /> Capitán
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="line-clamp-2 text-sm text-muted-foreground">
                  {g.description || 'Sin descripción.'}
                </p>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <Users className="h-4 w-4" /> {g._count.members} cracks
                  </span>
                  <code className="rounded-md bg-secondary px-2 py-1 text-xs font-bold">
                    {g.inviteCode}
                  </code>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {!isLoading && groups?.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
            <div className="grid h-14 w-14 place-items-center rounded-2xl bg-primary/10 text-primary">
              <Users className="h-7 w-7" />
            </div>
            <p className="font-display text-xl uppercase tracking-tight">
              Todavía no tenés barra
            </p>
            <p className="max-w-sm text-sm text-muted-foreground">
              Armá tu primera barra y pasá el código a los pibes, o sumate a una
              con el código que te pasaron.
            </p>
            <div className="mt-2 flex gap-2">
              <JoinGroupDialog />
              <CreateGroupDialog />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function CreateGroupDialog() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const create = useCreateGroup();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4" /> Armar barra
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-display text-2xl uppercase tracking-tight">
            Armá tu barra
          </DialogTitle>
          <DialogDescription>
            Ponele nombre y pasá el código a los pibes.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">Nombre de la barra</Label>
            <Input
              id="name"
              placeholder="Los Pibes del Barrio"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="desc">Descripción (opcional)</Label>
            <Input
              id="desc"
              placeholder="El prode más picante de la oficina"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <Button
            className="w-full"
            disabled={name.trim().length < 3 || create.isPending}
            onClick={() =>
              create.mutate(
                { name, description: description || undefined },
                { onSuccess: () => setOpen(false) },
              )
            }
          >
            {create.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Armar barra
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function JoinGroupDialog() {
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState('');
  const join = useJoinGroup();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <LogIn className="h-4 w-4" /> Sumarme
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-display text-2xl uppercase tracking-tight">
            Sumarme a una barra
          </DialogTitle>
          <DialogDescription>
            Pegá el código de invitación que te pasaron.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            placeholder="Ej: ABC1234"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            className="text-center font-display text-lg font-bold tracking-widest"
          />
          <Button
            className="w-full"
            disabled={code.trim().length < 6 || join.isPending}
            onClick={() =>
              join.mutate(code.trim(), { onSuccess: () => setOpen(false) })
            }
          >
            {join.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Sumarme a la barra
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
