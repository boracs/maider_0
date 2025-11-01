import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import PrimaryButton from "@/Components/PrimaryButton";
import TextInput from "@/Components/TextInput";
import { Transition } from "@headlessui/react";
import { Link, useForm, usePage } from "@inertiajs/react";

export default function UpdateProfileInformation({
    mustVerifyEmail,
    status,
    className = "",
}) {
    const user = usePage().props.auth.user;

    const { data, setData, patch, errors, processing, recentlySuccessful } =
        useForm({
            apellido: user.apellido || " ",
            telefono: user.telefono || " ",
            nombre: user.nombre || " ",
            email: user.email || " ",
        });

    const submit = (e) => {
        e.preventDefault();
        patch(route("profile.update"));
    };

    return (
        <section className={className}>
            <header>
                <h2 className="text-lg font-medium text-gray-900">
                    Informacion de tu perfil:
                </h2>

                <p className="mt-1 text-sm text-gray-600">
                    Aqui podras modificar los datos según te interese.
                </p>
            </header>

            {/* Formulario */}
            <form onSubmit={submit} className="mt-6 space-y-6">
                {/* Nombre */}
                <div>
                    <InputLabel htmlFor="nombre" value="Nombre" />
                    <TextInput
                        id="nombre"
                        className="mt-1 block w-full p-3 border rounded-md focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all duration-300 ease-in-out"
                        value={data.nombre}
                        onChange={(e) => setData("nombre", e.target.value)}
                        required
                        isFocused
                        autoComplete="nombre"
                        placeholder="Tu nombre"
                    />
                    <InputError className="mt-2" message={errors.nombre} />
                </div>

                {/* Teléfono */}
                <div>
                    <InputLabel htmlFor="telefono" value="Teléfono" />
                    <TextInput
                        id="telefono"
                        className="mt-1 block w-full p-3 border rounded-md focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all duration-300 ease-in-out"
                        value={data.telefono}
                        onChange={(e) => setData("telefono", e.target.value)}
                        required
                        isFocused
                        autoComplete="telefono"
                        placeholder="Tu teléfono"
                    />
                    <InputError className="mt-2" message={errors.telefono} />
                </div>

                {/* Apellido */}
                <div>
                    <InputLabel htmlFor="apellido" value="Apellido" />
                    <TextInput
                        id="apellido"
                        className="mt-1 block w-full p-3 border rounded-md focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all duration-300 ease-in-out"
                        value={data.apellido}
                        onChange={(e) => setData("apellido", e.target.value)}
                        required
                        isFocused
                        autoComplete="apellido"
                        placeholder="Tu apellido"
                    />
                    <InputError className="mt-2" message={errors.apellido} />
                </div>

                {/* Email */}
                <div>
                    <InputLabel htmlFor="email" value="Email" />
                    <TextInput
                        id="email"
                        type="email"
                        className="mt-1 block w-full p-3 border rounded-md focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all duration-300 ease-in-out"
                        value={data.email}
                        onChange={(e) => setData("email", e.target.value)}
                        required
                        autoComplete="email"
                        placeholder="Tu email"
                    />
                    <InputError className="mt-2" message={errors.email} />
                </div>

                {/* Verificación de email */}
                {mustVerifyEmail && user.email_verified_at === null && (
                    <div>
                        <p className="mt-2 text-sm text-gray-800">
                            Your email address is unverified.
                            <Link
                                href={route("verification.send")}
                                method="post"
                                as="button"
                                className="rounded-md text-sm text-gray-600 underline hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                            >
                                Click here to re-send the verification email.
                            </Link>
                        </p>

                        {status === "verification-link-sent" && (
                            <div className="mt-2 text-sm font-medium text-green-600">
                                A new verification link has been sent to your
                                email address.
                            </div>
                        )}
                    </div>
                )}

                {/* Botón de guardar */}
                <div className="flex items-center gap-4">
                    <PrimaryButton disabled={processing}>Save</PrimaryButton>

                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-in-out"
                        enterFrom="opacity-0"
                        leave="transition ease-in-out"
                        leaveTo="opacity-0"
                    >
                        <p className="text-sm text-gray-600">Saved...</p>
                    </Transition>
                </div>
            </form>
        </section>
    );
}
