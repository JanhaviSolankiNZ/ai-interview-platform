import React from "react";
import {
    FormControl,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Controller, Control, FieldValues, Path } from "react-hook-form";

interface Option {
    label: string;
    value: string;
}

interface FormRadioGroupProps<T extends FieldValues> {
    control: Control<T>;
    name: Path<T>;
    label: string;
    options: Option[];
}

const FormRadioGroup = <T extends FieldValues>({
                                                   control,
                                                   name,
                                                   label,
                                                   options,
                                               }: FormRadioGroupProps<T>) => (
    <Controller
        control={control}
        name={name}
        render={({ field }) => (
            <FormItem>
                <FormLabel className="label">{label}</FormLabel>
                <FormControl>
                    <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col gap-2"
                    >
                        {options.map((option) => (
                            <FormItem
                                key={option.value}
                                className="flex items-center space-x-2"
                            >
                                <FormControl>
                                    <RadioGroupItem value={option.value} />
                                </FormControl>
                                <FormLabel className="font-normal">
                                    {option.label}
                                </FormLabel>
                            </FormItem>
                        ))}
                    </RadioGroup>
                </FormControl>
                <FormMessage />
            </FormItem>
        )}
    />
);

export default FormRadioGroup;
