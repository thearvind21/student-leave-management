DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'avatar_pics_are_publicly_accessible'
  ) THEN
    EXECUTE $sql$
      CREATE POLICY avatar_pics_are_publicly_accessible
      ON storage.objects FOR SELECT
      TO public
      USING (bucket_id = 'profile_pics');
    $sql$;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'users_can_upload_their_avatars'
  ) THEN
    EXECUTE $sql$
      CREATE POLICY users_can_upload_their_avatars
      ON storage.objects FOR INSERT
      TO authenticated
      WITH CHECK (
        bucket_id = 'profile_pics' AND
        (storage.foldername(name))[1] = auth.uid()::text
      );
    $sql$;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'users_can_update_their_avatars'
  ) THEN
    EXECUTE $sql$
      CREATE POLICY users_can_update_their_avatars
      ON storage.objects FOR UPDATE
      TO authenticated
      USING (
        bucket_id = 'profile_pics' AND
        (storage.foldername(name))[1] = auth.uid()::text
      )
      WITH CHECK (
        bucket_id = 'profile_pics' AND
        (storage.foldername(name))[1] = auth.uid()::text
      );
    $sql$;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'users_can_delete_their_avatars'
  ) THEN
    EXECUTE $sql$
      CREATE POLICY users_can_delete_their_avatars
      ON storage.objects FOR DELETE
      TO authenticated
      USING (
        bucket_id = 'profile_pics' AND
        (storage.foldername(name))[1] = auth.uid()::text
      );
    $sql$;
  END IF;
END $$;