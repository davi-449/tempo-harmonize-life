
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function UserSettings() {
  const { user, updateUserProfile } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await updateUserProfile({ name, email });
      toast.success('Perfil atualizado com sucesso');
    } catch (error) {
      toast.error('Falha ao atualizar perfil');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Informações da Conta</CardTitle>
          <CardDescription>
            Atualize suas informações pessoais.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="flex flex-col items-center justify-center sm:flex-row sm:space-x-4 mb-4">
              <Avatar className="h-24 w-24">
                <AvatarImage src="" alt={name} />
                <AvatarFallback className="text-2xl">
                  {name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <div className="mt-4 sm:mt-0">
                <h3 className="text-lg font-medium">{name}</h3>
                <p className="text-sm text-muted-foreground">{email}</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="name">Nome</Label>
                <Input 
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="email">E-mail</Label>
                <Input 
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </CardFooter>
        </form>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Preferências de Tema</CardTitle>
          <CardDescription>
            Personalize a aparência do aplicativo.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Use o botão de alternar tema na barra de navegação para mudar entre os modos escuro e claro.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
