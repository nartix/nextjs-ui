export async function handleLogout({
  CSRFToken,
  logoutAction,
  closeDrawer,
  setIsLoggingOut,
}: {
  CSRFToken: string | undefined;
  logoutAction: (formData: FormData) => Promise<unknown>;
  closeDrawer: () => void;
  setIsLoggingOut: (v: boolean) => void;
}) {
  setIsLoggingOut(true);
  try {
    const formData = new FormData();
    formData.append('csrf_token', CSRFToken || '');
    await logoutAction(formData);
  } catch (error: unknown) {
    if (!(error instanceof Error && error.message === 'NEXT_REDIRECT')) {
      console.error('Logout failed:', error);
    }
  } finally {
    setIsLoggingOut(false);
    closeDrawer();
  }
}
