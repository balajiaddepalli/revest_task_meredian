import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Snackbar, Alert, AlertColor, Button } from '@mui/material';

export interface ToastAction {
  label: string;
  onClick: () => void;
}

interface ToastContextValue {
  showToast: (message: string, severity?: AlertColor, action?: ToastAction) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [severity, setSeverity] = useState<AlertColor>('success');
  const [action, setAction] = useState<ToastAction | undefined>();

  const showToast = useCallback((msg: string, sev: AlertColor = 'success', toastAction?: ToastAction) => {
    setMessage(msg);
    setSeverity(sev);
    setAction(toastAction);
    setOpen(true);
  }, []);

  const handleAction = () => {
    setOpen(false);
    action?.onClick();
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <Snackbar
        open={open}
        autoHideDuration={action ? 6000 : 4000}
        onClose={() => setOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setOpen(false)}
          severity={severity}
          variant="filled"
          action={
            action ? (
              <Button color="inherit" size="small" onClick={handleAction} sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>
                {action.label}
              </Button>
            ) : undefined
          }
        >
          {message}
        </Alert>
      </Snackbar>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
