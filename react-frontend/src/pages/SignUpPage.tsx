import { Description, Field, Fieldset, Input, Label, Legend } from '@headlessui/react'
import clsx from 'clsx'
import type { FC } from "react";
import { signUp } from '../services/authService';
import { Button } from '@headlessui/react';
import { useAtom, useSetAtom } from 'jotai';
import { userAtom } from '../atoms/userAtom';
import { atom } from 'jotai';

const errorAtom = atom<string | null>(null)

export const SignUpPage: FC = () => {
  const setUser = useSetAtom(userAtom);
  const [error,setError] = useAtom(errorAtom)
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      username: formData.get("username") as string,
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      passwordConfirm: formData.get("passwordConfirm") as string,
    };

    if (data.password !== data.passwordConfirm) {
      setError("Passwords do not match");
      return;
    }
    // Remove passwordConfirm before sending to backend
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordConfirm, ...submitData } = data;
    const result = await signUp(submitData);
    if (result && result.payload) {
      setUser(result.payload);
      setError(null);
    } else {
      setError("Sign up failed. Please try again.");
    }
  }

  return (
  <div className="w-full max-w-lg px-4">
    <form onSubmit={handleSubmit}>
      <Fieldset className="space-y-6 rounded-xl bg-white/5 p-6 sm:p-10">
        <Legend className="text-base/7 font-semibold text-white">Sign Up</Legend>
        {error && <div className="text-red-500">{error}</div>}
        <Field>
          <Label className="text-sm/6 font-medium text-white">Username</Label>
          <Description className="text-sm/6 text-white/50">Required</Description>
          <Input type='text' name='username' required
            className={clsx(
              'mt-3 block w-full rounded-lg border-none bg-white/5 px-3 py-1.5 text-sm/6 text-white',
              'focus:not-data-focus:outline-none data-focus:outline-2 data-focus:-outline-offset-2 data-focus:outline-white/25'
          )}/>
        </Field>
        <Field>
          <Label className="text-sm/6 font-medium text-white">Email</Label>
          <Description className="text-sm/6 text-white/50">Required</Description>
          <Input type='email' name='email' required
            className={clsx(
              'mt-3 block w-full rounded-lg border-none bg-white/5 px-3 py-1.5 text-sm/6 text-white',
              'focus:not-data-focus:outline-none data-focus:outline-2 data-focus:-outline-offset-2 data-focus:outline-white/25'
          )}/>
        </Field>
        <Field>
          <Label className="text-sm/6 font-medium text-white">Password</Label>
          <Description className="text-sm/6 text-white/50">Required</Description>
          <Input type='password' name='password' required
            className={clsx(
              'mt-3 block w-full rounded-lg border-none bg-white/5 px-3 py-1.5 text-sm/6 text-white',
              'focus:not-data-focus:outline-none data-focus:outline-2 data-focus:-outline-offset-2 data-focus:outline-white/25'
          )}/>
        </Field>
        <Field>
          <Label className="text-sm/6 font-medium text-white">Confirm Password</Label>
          <Description className="text-sm/6 text-white/50">Required</Description>
          <Input type='password' name='passwordConfirm' required
            className={clsx(
              'mt-3 block w-full rounded-lg border-none bg-white/5 px-3 py-1.5 text-sm/6 text-white',
              'focus:not-data-focus:outline-none data-focus:outline-2 data-focus:-outline-offset-2 data-focus:outline-white/25'
          )}/>
        </Field>
        <Button className="rounded bg-sky-600 px-4 py-2 text-sm text-white data-active:bg-sky-700 data-hover:bg-sky-500">Submit</Button>
      </Fieldset>
    </form>
  </div>
  );
};