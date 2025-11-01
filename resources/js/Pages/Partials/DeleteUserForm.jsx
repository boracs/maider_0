import { useForm } from "@inertiajs/react";
import { useRef, useState } from "react";

export default function DeleteUserForm({ className = "" }) {
    const [confirmingUserDeletion, setConfirmingUserDeletion] = useState(false);
    const passwordInput = useRef();

    const {
        data,
        setData,
        delete: destroy,
        processing,
        reset,
        errors,
        clearErrors,
    } = useForm({
        password: "",
    });

    const confirmUserDeletion = () => {
        setConfirmingUserDeletion(true);
    };

    const deleteUser = (e) => {
        e.preventDefault();

        destroy(route("profile.destroy"), {
            preserveScroll: true,
            onSuccess: () => closeModal(),
            onError: () => passwordInput.current.focus(),
            onFinish: () => reset(),
        });
    };

    const closeModal = () => {
        setConfirmingUserDeletion(false);
        clearErrors();
        reset();
    };

    return (
        <section className={`space-y-6 ${className}`}>
            <header>
                <h2 className="text-lg font-medium text-gray-900">
                    Delete Account
                </h2>

                <p className="mt-1 text-sm text-gray-600">
                    Once your account is deleted, all of its resources and data
                    will be permanently deleted. Before deleting your account,
                    please download any data or information that you wish to
                    retain.
                </p>
            </header>

            {/* Danger Button */}
            <button
                onClick={confirmUserDeletion}
                className="inline-flex items-center justify-center bg-gradient-to-r from-red-500 to-red-700 px-6 py-3 text-white font-semibold uppercase text-xs tracking-wider rounded-md transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg focus:ring-4 focus:ring-red-500 focus:ring-offset-2 focus:outline-none active:scale-95 active:bg-red-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                Delete Account
            </button>

            {/* Modal */}
            {confirmingUserDeletion && (
                <div className="fixed inset-0 flex justify-center items-center bg-gray-800 bg-opacity-50 z-50">
                    <div className="bg-white p-6 rounded-lg w-96">
                        <h2 className="text-lg font-medium text-gray-900">
                            Are you sure you want to delete your account?
                        </h2>

                        <p className="mt-1 text-sm text-gray-600">
                            Once your account is deleted, all of its resources
                            and data will be permanently deleted. Please enter
                            your password to confirm you would like to
                            permanently delete your account.
                        </p>

                        <div className="mt-6">
                            {/* Password Input */}
                            <label htmlFor="password" className="sr-only">
                                Password
                            </label>
                            <input
                                id="password"
                                type="password"
                                name="password"
                                ref={passwordInput}
                                value={data.password}
                                onChange={(e) =>
                                    setData("password", e.target.value)
                                }
                                className="mt-1 block w-3/4 p-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 ease-in-out"
                                placeholder="Password"
                            />

                            {errors.password && (
                                <p className="mt-2 text-sm text-red-600">
                                    {errors.password}
                                </p>
                            )}
                        </div>

                        <div className="mt-6 flex justify-end">
                            {/* Secondary Button */}
                            <button
                                onClick={closeModal}
                                className="px-6 py-3 text-sm font-medium text-gray-600 bg-gray-200 rounded-md hover:bg-gray-300 transition-all duration-300 ease-in-out focus:outline-none"
                            >
                                Cancel
                            </button>

                            {/* Danger Button (Delete) */}
                            <button
                                onClick={deleteUser}
                                className="ml-3 px-6 py-3 text-sm font-medium text-white bg-gradient-to-r from-red-500 to-red-700 rounded-md hover:scale-105 hover:shadow-lg transition-all duration-300 ease-in-out active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={processing}
                            >
                                {processing ? "Deleting..." : "Delete Account"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}
