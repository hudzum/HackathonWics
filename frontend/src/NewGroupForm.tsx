"use client";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { CloudUpload, Paperclip } from "lucide-react";
import {
  FileInput,
  FileUploader,
  FileUploaderContent,
  FileUploaderItem,
} from "@/components/ui/file-uploader";
import { TagsInput } from "@/components/ui/tags-input";

import { useAuthContext } from "./auth/context";
import { uploadImageAndSaveData } from "./UploadAndSave";
import {arrayUnion, collection, doc, getDocs, updateDoc} from "firebase/firestore";
import {db} from "@/configuration.ts";

const formSchema = z.object({
  name_5442261733: z.string().min(1),

  name_2830638755: z.array(z.string()).nonempty("Please at least one item"),
  name_6577586194: z.string().min(1).optional(),
  name_0795734836: z.string().min(1),
});

export default function NewGroupForm() {
  const { user } = useAuthContext();

  const [files, setFiles] = useState<File[] | null>(null);
  const [usersMapping, setUsersMapping] = useState<{ [email: string]: string } | undefined>({});

  useEffect(() => {
    (async () => {
      const usersCollectionRef = collection(db, "users");
      const querySnapshot = await getDocs(usersCollectionRef);

      const usersMapping: { [email: string]: string } = {}; // Mapping of emails to user ids
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.email) {
          usersMapping[data.email] = doc.id;
        }
      });
      setUsersMapping(usersMapping);
    })();
  }, []);

  const dropZoneConfig = {
    maxFiles: 1,
    maxSize: 1024 * 1024 * 4,
    multiple: false,
  };
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name_5442261733: "Couch",
      name_6577586194: "couchlink",
      name_0795734836: "300",
      name_2830638755: [],
    },
  });

  useEffect(() => {
    console.log(files);
  }, [files]);

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log("Submitted values:");
    console.log(values);
    try {
      console.log("Submitted values:");
      console.log(values);

      // Check if user is authenticated
      if (!user) {
        toast.error("You must be logged in to submit this form");
        return;
      }
      if (!files) {
        toast.error("Please select an image");
        return;
      }
      // Create a new document in the "items" collection
      const saveToFirebase = async () => {
        // Prepare the data object

        toast.loading("Uploading your item...");

        const otherGroupMembers = [...values.name_2830638755.values()].map(email => usersMapping[email]);

        const formData = {
          itemName: values.name_5442261733,
          groupMembers: [user.uid, ...otherGroupMembers], // Convert to array
          itemLink: values.name_6577586194 || null,
          cost: Number(values.name_0795734836),
        };



        // Add the document to the "items" collection
        const result = await uploadImageAndSaveData(
          // The file object or null if files is null
          files[0],
          formData,
          user.uid
        );

        //Adds the id to teh users array of items

        for (const otherMember of otherGroupMembers) {
          console.log("other", otherMember);
          const itemDocRef = doc(db, "users", otherMember);

          await updateDoc(itemDocRef, {
            items: arrayUnion({itemId: result.id, itemName: formData.itemName}),
          });
        }
        console.log(result);

        toast.dismiss();
        toast.success("Item added successfully!");

        // You might want to navigate or clear the form here
        window.location.reload();
      };

      saveToFirebase();

      // Still show the values in toast for debugging
      toast(
        <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
          <code className="text-white">{JSON.stringify(values, null, 2)}</code>
        </pre>
      );
    } catch (error) {
      console.error("Form submission error", error);
      toast.error("Failed to submit the form. Please try again.");
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6 max-w-3xl mx-auto "
      >
        <FormField
          control={form.control}
          name="name_5442261733"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Item Name</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Couch" type="" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FileUploader
          value={files}
          onValueChange={setFiles}
          dropzoneOptions={dropZoneConfig}
          className="relative bg-background rounded-lg p-2"
        >
          <FileInput
            id="fileInput"
            className="outline-dashed outline-1 outline-slate-500"
          >
            <div className="flex items-center justify-center flex-col p-8 w-full">
              <CloudUpload className="text-gray-500 w-10 h-10" />
              <p className="mb-1 text-sm text-gray-500 dark:text-gray-400">
                <span className="font-semibold">Click to upload</span>&nbsp; or
                drag and drop
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                SVG, PNG, JPG or GIF
              </p>
            </div>
          </FileInput>
          <FileUploaderContent>
            {files &&
              files.length > 0 &&
              files.map((file, i) => (
                <FileUploaderItem key={i} index={i}>
                  <Paperclip className="h-4 w-4 stroke-current" />
                  <span>{file.name}</span>
                </FileUploaderItem>
              ))}
          </FileUploaderContent>
        </FileUploader>

        {
          (Object.keys(usersMapping || {}).length > 0) ? (
              <FormField
                  control={form.control}
                  name="name_2830638755"
                  render={({ field }) => (
                      <FormItem>
                        <FormLabel>Enter Emails</FormLabel>
                        <FormControl>
                          <TagsInput
                              value={field.value}
                              onValueChange={emails => {
                                console.log(emails, usersMapping);
                                const goodEmails = emails.filter(email => email in usersMapping);
                                if (goodEmails.length !== emails.length) alert('User with email does not exist');

                                field.onChange(goodEmails);
                              }}
                              placeholder="Enter your group members emails"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                  )}
              />
              ) : (
              <p>Loading Emails</p>
          )
        }

        <FormField
          control={form.control}
          name="name_6577586194"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Item Link</FormLabel>
              <FormControl>
                <Input
                  placeholder="Ex: https://www.amazon.com/couch"
                  type=""
                  {...field}
                />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="name_0795734836"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Total Cost</FormLabel>
              <FormControl>
                <Input placeholder="Ex: 300" type="number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Submit New Group</Button>
      </form>
    </Form>
  );
}
