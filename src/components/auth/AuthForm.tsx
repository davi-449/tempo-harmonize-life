import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Checkbox } from '@/components/ui/checkbox';
import { Apple, ArrowRight, AtSign, Facebook, Github, Loader2, Lock, Mail, User } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function AuthForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const { login, register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      if (isLogin) {
        await login(email, password);
        toast.success('Login realizado com sucesso!');
      } else {
        await register(name, email, password);
        toast.success('Cadastro realizado com sucesso!');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Falha na autenticação');
    } finally {
      setIsLoading(false);
    }
  };
  
  const socialLoginButtons = [
    { icon: <Mail className="h-5 w-5" />, name: "Google", color: "hover:bg-red-50 dark:hover:bg-red-950/30" },
    { icon: <Apple className="h-5 w-5" />, name: "Apple", color: "hover:bg-gray-50 dark:hover:bg-gray-950/30" },
    { icon: <Facebook className="h-5 w-5" />, name: "Facebook", color: "hover:bg-blue-50 dark:hover:bg-blue-950/30" },
    { icon: <Github className="h-5 w-5" />, name: "Github", color: "hover:bg-gray-50 dark:hover:bg-gray-950/30" },
  ];

  const inputVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (custom: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: custom * 0.1, duration: 0.3 }
    })
  };

  return (
    <Card className="w-full max-w-md mx-auto shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold text-center">
          {isLogin ? 'Entre na sua conta' : 'Crie sua conta'}
        </CardTitle>
        <CardDescription className="text-center">
          {isLogin 
            ? 'Digite seu email e senha para acessar sua conta' 
            : 'Crie uma nova conta para começar'
          }
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.1
                }
              }
            }}
            className="space-y-4"
          >
            {!isLogin && (
              <motion.div 
                variants={inputVariants}
                custom={0}
                className="space-y-2"
              >
                <Label htmlFor="name" className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  Nome
                </Label>
                <Input
                  id="name"
                  placeholder="Digite seu nome"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required={!isLogin}
                  disabled={isLoading}
                  className="transition-all duration-300 focus-within:ring-primary"
                />
              </motion.div>
            )}
            
            <motion.div 
              variants={inputVariants}
              custom={isLogin ? 0 : 1}
              className="space-y-2"
            >
              <Label htmlFor="email" className="flex items-center gap-2">
                <AtSign className="h-4 w-4 text-muted-foreground" />
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="seunome@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className="transition-all duration-300 focus-within:ring-primary"
              />
            </motion.div>
            
            <motion.div 
              variants={inputVariants} 
              custom={isLogin ? 1 : 2}
              className="space-y-2"
            >
              <Label htmlFor="password" className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-muted-foreground" />
                Senha
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                className="transition-all duration-300 focus-within:ring-primary"
              />
            </motion.div>
            
            {isLogin && (
              <motion.div
                variants={inputVariants}
                custom={2}
                className="flex items-center justify-between"
              >
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="remember" 
                    checked={rememberMe}
                    onCheckedChange={() => setRememberMe(!rememberMe)}
                  />
                  <Label htmlFor="remember" className="text-sm font-normal cursor-pointer">
                    Lembrar-me
                  </Label>
                </div>
                <a href="#" className="text-sm text-primary hover:underline">
                  Esqueceu a senha?
                </a>
              </motion.div>
            )}
          </motion.div>
            
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="pt-2"
          >
            <Button 
              type="submit" 
              className="w-full group" 
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  {isLogin ? 'Entrar' : 'Criar conta'}
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </Button>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="relative mt-6 pt-6"
          >
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-muted-foreground/20" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                ou continue com
              </span>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="grid grid-cols-4 gap-2"
          >
            {socialLoginButtons.map((btn, i) => (
              <motion.button
                key={btn.name}
                type="button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={cn(
                  "flex items-center justify-center p-2 rounded-md border border-input transition-colors",
                  btn.color
                )}
                title={`Continuar com ${btn.name}`}
                aria-label={`Continuar com ${btn.name}`}
              >
                {btn.icon}
              </motion.button>
            ))}
          </motion.div>
        </CardContent>
        
        <CardFooter className="flex flex-col space-y-4">
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="text-center text-sm"
          >
            {isLogin ? "Não tem uma conta? " : "Já tem uma conta? "}
            <button
              type="button"
              className="text-primary hover:underline font-medium"
              onClick={() => setIsLogin(!isLogin)}
            >
              {isLogin ? 'Cadastre-se' : 'Entre'}
            </button>
          </motion.p>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-xs text-center text-muted-foreground"
          >
            Ao continuar, você concorda com os nossos{" "}
            <a href="#" className="underline hover:text-primary">Termos de Serviço</a>
            {" "}e{" "}
            <a href="#" className="underline hover:text-primary">Política de Privacidade</a>.
          </motion.p>
        </CardFooter>
      </form>
    </Card>
  );
}
