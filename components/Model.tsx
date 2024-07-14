"use client";

import { addUserEmailToProduct } from "@/lib/actions";
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Disclosure,
  DisclosurePanel,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import Image from "next/image";
import React, { FormEvent, Fragment, useState } from "react";

//type interface
interface Props {
  productId: string
}


const Model = ({ productId }: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [email, setEmail] = useState("");

  //submit form value with form html event
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setIsSubmitting(true);
    //add user email to product than close the model
    await addUserEmailToProduct(productId, email)

    setIsSubmitting(false);
    setEmail('')
    closeModel()
  };

  const openModel = () => setIsOpen(true);
  const closeModel = () => setIsOpen(false);

  return (
    <>
      <button className="btn" onClick={openModel}>
        Track
      </button>

      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" onClose={closeModel} className="dialog-container">
          <div className="min-h-screen px-4 text-center">
            <TransitionChild
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <DialogTitle className="fixed inset-0" />
            </TransitionChild>

            <span
              className="inline-block h-screen align-middle"
              aria-hidden="true"
            />

            <TransitionChild
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <div className="dialog-content">
                <div className="flex flex-col">
                  <div className="flex justify-between">
                    <div className="p-3 border border-gray-200 rounded-10">
                      <Image
                        src="/assets/icons/logo.svg"
                        width={28}
                        height={28}
                        alt="logo"
                      />
                    </div>

                    <Image
                      onClick={closeModel}
                      src="/assets/icons/x-close.svg"
                      alt="close"
                      width={24}
                      height={24}
                      className="cursor-pointer"
                    />
                  </div>

                  <h4 className="dialog-head_text">
                    Stay updated with product pricing alerts right in your
                    inbox!
                  </h4>

                  <p className="text-sm text-gray-600 mt-2">
                    Never miss a bargain again with our timely alerts!
                  </p>
                </div>

                <form className="flex flex-col mt-5" onSubmit={handleSubmit}>
                  <label
                    htmlFor="email"
                    className="text-sm font-medium text-gray-700"
                  >
                    Email Address
                  </label>

                  <div className="dialog-input_container">
                    <Image
                      src="/assets/icons/mail.svg"
                      alt="email"
                      width={18}
                      height={18}
                    />

                    <input
                      required
                      type="email"
                      id="email"
                      className="dialog-input"
                      placeholder="Enter your Email Address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>

                  <button className="dialog-btn">
                    {isSubmitting ? 'Submmiting' : 'Track'}
                  </button>
                </form>
              </div>
            </TransitionChild>
          </div>
        </Dialog>
      </Transition>
    </>
  );
};

export default Model;
