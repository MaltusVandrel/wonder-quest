import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { removeToast } from '@/store/slices/uiSlice';

const TOAST_MAX_TIME = 7500;
const TOAST_REMOVE_TRANSITION = 300;

export const ToastOverlay: React.FC = () => {
  const dispatch = useAppDispatch();
  const toasts = useAppSelector((s) => s.ui.toasts);

  useEffect(() => {
    const timers = toasts.map((toast) => {
      const timer = setTimeout(() => {
        dispatch(removeToast(toast.id));
      }, TOAST_MAX_TIME + TOAST_REMOVE_TRANSITION);
      return timer;
    });
    return () => {
      timers.forEach(clearTimeout);
    };
  }, [toasts, dispatch]);

  return (
    <div id="toast-holder">
      {toasts.map((toast) => {
        const description = Array.isArray(toast.encounter.description)
          ? toast.encounter.description.join('<br/>')
          : toast.encounter.description;
        return (
          <div
            key={toast.id}
            className={`toast-element ${toast.encounter.key}`}
            dangerouslySetInnerHTML={{
              __html: description + (toast.count > 1 ? `<strong>x${toast.count}</strong>` : ''),
            }}
          />
        );
      })}
    </div>
  );
};
